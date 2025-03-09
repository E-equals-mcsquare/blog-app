import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { fromNodeProviderChain } from "@aws-sdk/credential-provider-node";

// Determine credentials dynamically
const getCredentials = () => {
    if (process.env.NODE_ENV === "development") {
        // Use local credentials file when running locally
        return fromIni();
    } else {
        // Use IAM role-based authentication when deployed in AWS
        return fromNodeProviderChain();
    }
};

const client = new DynamoDBClient({ 
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: getCredentials(), 
});

export default client;