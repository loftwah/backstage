import { ErrorApi, ErrorContext } from '../../../';
import { Color } from '@material-ui/lab';

type SubscriberFunc = (error: Error) => void;
type Unsubscribe = () => void;

// TODO: figure out where to put implementations of APIs, both inside apps
// but also in core/separate package.
export class ErrorApiForwarder implements ErrorApi {
  private readonly subscribers = new Set<SubscriberFunc>();
  severity: Color = 'info';

  post(error: Error, context?: ErrorContext) {
    if (context?.hidden) {
      return;
    }

    this.subscribers.forEach(subscriber => subscriber(error));
  }

  subscribe(func: SubscriberFunc): Unsubscribe {
    this.subscribers.add(func);

    return () => {
      this.subscribers.delete(func);
    };
  }
}
