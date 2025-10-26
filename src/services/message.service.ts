import axios from 'axios';
import { config } from '../config';
import logger from '../config/logger';
import { calculateYearsOfService } from '../utils/timezone.util';

export type MessageType = 'ANNIVERSARY' 

export function buildAnniversaryMessage(
  firstName: string,
  lastName: string,
  startDate: Date
): string {
  const fullName = `${firstName} ${lastName}`;
  const years = calculateYearsOfService(startDate);
  
  return `Hey, ${fullName}, congratulations on your ${years}-year work anniversary!`;
}


export function buildMessage(
  messageType: MessageType,
  firstName: string,
  lastName: string,
  startDate?: Date
): string {
  if (messageType === 'ANNIVERSARY') {
    if (!startDate) {
      throw new Error('Start date is required for anniversary messages');
    }
    return buildAnniversaryMessage(firstName, lastName, startDate);
  }
  else  throw new Error('Unknown message type');
 
}

export async function sendMessageToWebhook(
  message: string,
  employeeId: string,
  messageType: MessageType
): Promise<void> {
  const payload = {
    message,
    employeeId,
    messageType,
    timestamp: new Date().toISOString(),
  };

  try {
    logger.info(
      { employeeId, messageType, webhookUrl: config.WEBHOOK_URL },
      'Sending message to webhook'
    );

    const response = await axios.post(config.WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Employee-Message-Service/1.0',
      },
      timeout: config.WEBHOOK_TIMEOUT_MS,
    });

    logger.info(
      {
        employeeId,
        messageType,
        statusCode: response.status,
        responseData: response.data,
      },
      'Message sent successfully'
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        {
          employeeId,
          messageType,
          error: error.message,
          statusCode: error.response?.status,
          responseData: error.response?.data,
        },
        'Failed to send message to webhook'
      );
      
      throw new Error(
        `Webhook delivery failed: ${error.message} (Status: ${error.response?.status || 'unknown'})`
      );
    }
    
    logger.error({ employeeId, messageType, error }, 'Unexpected error sending message');
    throw error;
  }
}

export class MessageService {
  async sendAnniversaryMessage(
    firstName: string,
    lastName: string,
    startDate: Date,
    employeeId: string
  ): Promise<void> {
    const message = buildAnniversaryMessage(firstName, lastName, startDate);
    await sendMessageToWebhook(message, employeeId, 'ANNIVERSARY');
  }


  async sendMessage(
    messageType: MessageType,
    firstName: string,
    lastName: string,
    employeeId: string,
    startDate?: Date
  ): Promise<void> {
    const message = buildMessage(messageType, firstName, lastName, startDate);
    await sendMessageToWebhook(message, employeeId, messageType);
  }
}

export default new MessageService();
