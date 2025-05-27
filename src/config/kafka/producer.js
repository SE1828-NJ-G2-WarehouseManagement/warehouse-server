import kafka from '../kafka.config.js';

const producer = kafka.producer();

export const publishEmail = async (emailData) => {
  await producer.connect();
  
  await producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [{ value: JSON.stringify(emailData) }],
  });
  console.log('mail data publish: ', emailData);

  await producer.disconnect();
};

// Example usage
// publishEmail({ to: 'test@user.com', subject: 'Hello', text: 'This is a test email.' });
