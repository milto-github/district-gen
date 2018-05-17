import { MeasurementProfile } from './measurementProfile';

export class User {
  public username: string;
  public password: string;
  public email: string;
  public role: string;
  public dateCreated: Date;
  public activeMeasurementProfile: MeasurementProfile;
  public measurementProfileHistory: MeasurementProfile[];
}
