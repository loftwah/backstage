/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { FC, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';
import { ErrorApiForwarder } from '@backstage/core';

type Props = {
  forwarder: ErrorApiForwarder;
};

// TODO: improve on this and promote to a shared component for use by all apps.
const AlertDisplay: FC<Props> = ({ forwarder }) => {
  const [errors, setErrors] = useState<Array<Error>>([]);

  useEffect(() => {
    return forwarder.subscribe((error: any) =>
      setErrors(errs => errs.concat(error)),
    );
  }, [forwarder]);

  if (errors.length === 0) {
    return null;
  }

  const [firstError] = errors;

  const handleClose = () => {
    setErrors(errs => errs.filter(err => err !== firstError));
  };

  return (
    <Snackbar
      open
      message={firstError.toString()}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={handleClose}
            data-testid="error-button-close"
          >
            <CloseIcon />
          </IconButton>
        }
        severity={forwarder.severity}
      >
        {firstError.toString()}
      </Alert>
    </Snackbar>
  );
};

AlertDisplay.propTypes = {
  forwarder: PropTypes.instanceOf(ErrorApiForwarder).isRequired,
};

export default AlertDisplay;
