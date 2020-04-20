import { AlertApi, AlertContext, AlertMessage } from '../../../';
import { Color } from '@material-ui/lab';

type SubscriberFunc = (error: string) => void;
type Unsubscribe = () => void;

// TODO: figure out where to put implementations of APIs, both inside apps
// but also in core/separate package.
export class AlertApiForwarder implements AlertApi {
  private readonly subscribers = new Set<SubscriberFunc>();
  severity: Color = 'info';

  post(alert: AlertMessage, context?: AlertContext) {
    if (context?.hidden) {
      return;
    }

    if (alert.severity) {
      this.severity = alert.severity;
    }
    this.subscribers.forEach(subscriber => subscriber(alert.message));
  }

  subscribe(func: SubscriberFunc): Unsubscribe {
    this.subscribers.add(func);

    return () => {
      this.subscribers.delete(func);
    };
  }
}
