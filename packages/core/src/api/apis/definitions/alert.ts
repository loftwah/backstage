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

import { Color } from '@material-ui/lab';
import ApiRef from '../ApiRef';

export type AlertMessage = {
  message: string;
  severity?: Color;
};

/**
 * Provides additional information about an alert that was posted to the application.
 */
export type AlertContext = {
  // If set to true, this message should not be displayed to the user. Defaults to false.
  hidden?: boolean;
};

/**
 * The alert API is used to report alerts to the app, and display them to the user.
 *
 * Plugins can use this API as a method of displaying alerts to the user, but also
 * to report alerts for collection by alert reporting services.
 *
 * If an alert can be displayed inline, e.g. as feedback in a form, that should be
 * preferred over relying on this API to display the alert. The main use of this api
 * for displaying alerts should be for asynchronous alerts, such as a failing background process.
 *
 * Even if an alert is displayed inline, it should still be reported through this api
 * if it would be useful to collect or log it for debugging purposes, but with
 * the hidden flag set. For example, an alert arising from form field validation
 * should probably not be reported, while a failed REST call would be useful to report.
 */

export type AlertApi = {
  /**
   * Post an alert for handling by the application.
   */
  post(alert: AlertMessage, context?: AlertContext);
};

export const alertApiRef = new ApiRef<AlertApi>({
  id: 'core.alert',
  description: 'Used to report alerts and forward them to the app',
});
