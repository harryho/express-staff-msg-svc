
import axios from 'axios';
import {
  buildAnniversaryMessage,
  sendMessageToWebhook,
  MessageService,
} from '../../src/services/message.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../../src/config', () => ({
  config: {
    WEBHOOK_URL: 'https://webhook-test.example.com/messages',
    WEBHOOK_TIMEOUT_MS: 5000,
  },
}));

describe('Message Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildAnniversaryMessage', () => {
    it('should build anniversary message for 1 year', () => {
      const startDate = new Date('2024-10-24');
      const message = buildAnniversaryMessage('John', 'Doe', startDate);

      expect(message).toBe('Hey, John Doe, congratulations on your 1-year work anniversary!');
    });

    it('should build anniversary message for 5 years', () => {
      const startDate = new Date('2020-10-24');
      const message = buildAnniversaryMessage('Alice', 'Johnson', startDate);

      expect(message).toBe('Hey, Alice Johnson, congratulations on your 5-year work anniversary!');
    });

    it('should build anniversary message for 10 years', () => {
      const startDate = new Date('2015-10-24');
      const message = buildAnniversaryMessage('Bob', 'Smith', startDate);

      expect(message).toBe('Hey, Bob Smith, congratulations on your 10-year work anniversary!');
    });

    it('should build anniversary message for 25 years', () => {
      const startDate = new Date('2000-10-24');
      const message = buildAnniversaryMessage('Carol', 'Williams', startDate);

      expect(message).toBe('Hey, Carol Williams, congratulations on your 25-year work anniversary!');
    });

    it('should handle names with special characters', () => {
      const startDate = new Date('2020-10-24');
      const message = buildAnniversaryMessage("O'Brien", 'José', startDate);

      expect(message).toBe("Hey, O'Brien José, congratulations on your 5-year work anniversary!");
    });

    it('should calculate years correctly for less than 1 year', () => {
      const startDate = new Date('2025-05-01');
      const message = buildAnniversaryMessage('New', 'Employee', startDate);

      expect(message).toBe('Hey, New Employee, congratulations on your 0-year work anniversary!');
    });
  });




  describe('sendMessageToWebhook', () => {
    const employeeId = 'test-employee-id';
    const message = 'Test message';

    it('should send message to webhook successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await expect(
        sendMessageToWebhook(message, employeeId, 'ANNIVERSARY')
      ).resolves.not.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://webhook-test.example.com/messages',
        expect.objectContaining({
          message,
          employeeId,
          messageType: 'ANNIVERSARY',
          timestamp: expect.any(String),
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Employee-Message-Service/1.0',
          },
          timeout: 5000,
        })
      );
    });



    it('should include timestamp in payload', async () => {
      const mockResponse = {
        status: 200,
        data: { success: true },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await sendMessageToWebhook(message, employeeId, 'ANNIVERSARY');

      const callArgs = mockedAxios.post.mock.calls[0];
      const payload = callArgs[1] as any;

      expect(payload.timestamp).toBeDefined();
      expect(typeof payload.timestamp).toBe('string');
      expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
    });

    it('should throw error on webhook failure with status code', async () => {
      const mockError = {
        message: 'Request failed',
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
        isAxiosError: true,
      };

      mockedAxios.post.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        sendMessageToWebhook(message, employeeId, 'ANNIVERSARY')
      ).rejects.toThrow('Webhook delivery failed: Request failed (Status: 404)');
    });

    it('should throw error on webhook timeout', async () => {
      const mockError = {
        message: 'timeout of 5000ms exceeded',
        response: undefined,
        isAxiosError: true,
      };

      mockedAxios.post.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(
        sendMessageToWebhook(message, employeeId, 'ANNIVERSARY')
      ).rejects.toThrow('Webhook delivery failed: timeout of 5000ms exceeded (Status: unknown)');
    });



    it('should handle non-axios errors', async () => {
      const mockError = new Error('Unexpected error');

      mockedAxios.post.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      await expect(
        sendMessageToWebhook(message, employeeId, 'ANNIVERSARY')
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('MessageService class', () => {
    let messageService: MessageService;

    beforeEach(() => {
      messageService = new MessageService();
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: { success: true },
      });
    });

    describe('sendAnniversaryMessage', () => {
      it('should send anniversary message', async () => {
        const startDate = new Date('2020-10-24');

        await messageService.sendAnniversaryMessage('John', 'Doe', startDate, 'emp-123');

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            message: 'Hey, John Doe, congratulations on your 5-year work anniversary!',
            employeeId: 'emp-123',
            messageType: 'ANNIVERSARY',
          }),
          expect.any(Object)
        );
      });
    });

    describe('sendMessage', () => {
      it('should send anniversary message via sendMessage', async () => {
        const startDate = new Date('2020-10-24');

        await messageService.sendMessage('ANNIVERSARY', 'Bob', 'Smith', 'emp-789', startDate);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            messageType: 'ANNIVERSARY',
            employeeId: 'emp-789',
          }),
          expect.any(Object)
        );
      });



      it('should throw error when sending anniversary without start date', async () => {
        await expect(
          messageService.sendMessage('ANNIVERSARY', 'John', 'Doe', 'emp-123')
        ).rejects.toThrow('Start date is required for anniversary messages');
      });
    });
  });
});
