package app

import (
	"context"
	"fmt"
	"github.com/golang/protobuf/jsonpb"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"log"

	identity "github.com/spotify/backstage/backend/proto/identity/v1"
	pb "github.com/spotify/backstage/backend/proto/scaffolder/v1"
	"github.com/spotify/backstage/scaffolder/cutter"
	"github.com/spotify/backstage/scaffolder/fs"
	"github.com/spotify/backstage/scaffolder/remote"
	"github.com/spotify/backstage/scaffolder/repository"
)

// Server is the inventory Grpc server
type Server struct {
	repository *repository.Repository
	github     *remote.Github
	fs         *fs.Filesystem
	cookie     *cutter.Cutter
}

// NewServer creates a new server for with all the things
func NewServer() *Server {
	return &Server{
		github: remote.NewGithubClient(),
	}
}

// Create scaffolds the repo in github and then will create push to the repository
func (s *Server) Create(ctx context.Context, req *pb.CreateRequest) (*pb.CreateReply, error) {
	// first create the repository with github
	log.Printf("Creating repository for Component %s", req.ComponentId)
	repo := remote.Repository{
		Name:    req.ComponentId,
		Org:     req.Org,
		Private: req.Private,
	}
	if _, err := s.github.CreateRepository(repo); err != nil {
		return nil, status.Error(codes.Internal, fmt.Sprintf("Could not create repository %s/%s", req.Org, req.ComponentId))
	}

	// move the template into a temporary directory
	tempFolder, err := s.fs.PrepareTemplate(
		fs.Template{
			ID: req.TemplateId,
		},
	)

	if err != nil {
		return nil, status.Error(codes.Internal, "Could not prepare the template")
	}

	// get the optional metadatafields from the json
	marshaler := &jsonpb.Marshaler{}
	cutterMetadata, err := marshaler.MarshalToString(req.Metadata)

	if err != nil {
		return nil, status.Error(codes.Internal, "Could not marshal the cookiecutter metadata")
	}

	cookieTemplate := cutter.CookieCutterTemplate{
		Path:        tempFolder,
		ComponentID: req.ComponentId,
		Metadata:    cutterMetadata,
	}

	// create the cookicutter json
	if err := s.cookie.WriteMetadata(cookieTemplate); err != nil {
		return nil, status.Error(codes.Internal, "Could not write cookie metadata")
	}

	// run the cookiecutter on the folder
	if err := s.cookie.Run(cookieTemplate); err != nil {
		return nil, status.Error(codes.Internal, "Failed to run the cookie cutter")
	}

	// use git bindings to add the remote with access token and push to the directory
	return nil, nil
}

// ListTemplates returns the local templatess
func (s *Server) ListTemplates(ctx context.Context, req *pb.Empty) (*pb.ListTemplatesReply, error) {
	// TODO(blam): yes we currently read the disk on every load. but it's fine for now 🤷‍♂️
	definitions, err := s.repository.Load()
	var templates []*pb.Template

	for _, definition := range definitions {
		template := &pb.Template{
			Id:          definition.ID,
			Name:        definition.Name,
			Description: definition.Description,

			// need to actually call the idenity service here to get the
			// actual user and propgate back when needed.
			User: &identity.User{
				Id:   "spotify",
				Name: "Spotify",
			},
		}

		templates = append(templates, template)
	}

	return &pb.ListTemplatesReply{
		Templates: templates,
	}, err
}
