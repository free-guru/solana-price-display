import { Logger } from "pino";
import dotenv from "dotenv";
import { logger } from "./logger";

dotenv.config();

const retrieveEnvVariable = (variableName: string, logger: Logger) => {
  const variable = process.env[variableName] || "";
  if (!variable) {
    logger.error(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

// SOL address
export const SOL_ADDRESS = retrieveEnvVariable("SOL_ADDRESS", logger);

// USDT address
export const USDT_ADDRESS = retrieveEnvVariable("USDT_ADDRESS", logger);

// server
export const PORT = Number.parseInt(retrieveEnvVariable("PORT", logger));

// Helius
export const HELIUS_API_KEY = retrieveEnvVariable("HELIUS_API_KEY", logger);

// Birdeye
export const BIRDEYE_API_KEY = retrieveEnvVariable("BIRDEYE_API_KEY", logger);

// filter transaction period
export const TRANSACTION_FILTER_PERIOD = Number.parseInt(
  retrieveEnvVariable("TRANSACTION_FILTER_PERIOD", logger)
);

// Account Addresses
export const RAYDIUM_AUTHORITY = retrieveEnvVariable(
  "RAYDIUM_AUTHORITY",
  logger
);
export const RAYDIUM_LIQUIDITY = retrieveEnvVariable(
  "RAYDIUM_LIQUIDITY",
  logger
);

// test

//// token address
export const TOKEN_ADDRESS = retrieveEnvVariable("TOKEN_ADDRESS", logger);
//// PAIR_ADDRESS
export const PAIR_ADDRESS = retrieveEnvVariable("PAIR_ADDRESS", logger);
