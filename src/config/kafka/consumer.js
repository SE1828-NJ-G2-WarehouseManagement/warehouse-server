import dotenv from "dotenv";
import kafka from "../kafka.config.js";
import { sendEmail } from "../../utils/email.utils.js";

dotenv.config();

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });


const run = async () => {

  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const emailData = JSON.parse(message.value.toString());
      await sendEmail(emailData);
    },
  });
};

run().catch(console.error);
