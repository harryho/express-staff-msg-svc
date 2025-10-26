export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  startDate: Date;
  birthDate?: Date;
  timezone: string;
  locationDisplay: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface MessageDelivery {
  id: string;
  employeeId: string;
  messageType: 'anniversary' ;
  scheduledDate: Date;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'failed';
  attemptCount: number;
  lastAttemptAt?: Date;
  sentAt?: Date;
  errorMessage?: string;
  jobId?: string;
  createdAt: Date;
}

export interface MessagePayload {
  message: string;
  employeeId: string;
  messageType: 'anniversary' ;
  scheduledTime: string;
}
