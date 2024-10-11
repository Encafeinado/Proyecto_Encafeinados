export interface Admin {
  _id:      string;
  email:    string;
  name:     string;
  phone:    string;
  isActive: boolean;
  roles:    string[];
}
