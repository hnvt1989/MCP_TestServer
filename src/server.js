"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@anthropic-ai/sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const readline = __importStar(require("readline"));
dotenv_1.default.config();
// Initialize Claude client
const anthropic = new sdk_1.Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || '',
});
function analyzeFailure(failure) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = `Analyze this Playwright test failure and determine if it's likely an actual application error or a potential test flakiness/infrastructure issue. Consider the error message, stack trace, and test context:

Test: ${failure.testName}
Error: ${failure.error}
Stack: ${failure.stack}`;
        const response = yield anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 1000,
            messages: [{ role: 'user', content: message }],
        });
        return {
            testName: failure.testName,
            analysis: response.content[0].text || '',
        };
    });
}
function processInput(input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const testResults = JSON.parse(input);
            if (!testResults.failures || testResults.failures.length === 0) {
                console.log(JSON.stringify({ message: 'No failures to analyze' }));
                return;
            }
            const analysisPromises = testResults.failures.map(analyzeFailure);
            const analyses = yield Promise.all(analysisPromises);
            console.log(JSON.stringify({ analyses }, null, 2));
        }
        catch (error) {
            console.error('Error analyzing test results:', error);
            process.exit(1);
        }
    });
}
// Set up readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
let inputData = '';
// Read input line by line
rl.on('line', (line) => {
    inputData += line;
});
// Process the complete input when stdin ends
rl.on('close', () => {
    processInput(inputData).catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
});
