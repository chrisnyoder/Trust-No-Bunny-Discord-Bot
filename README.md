# Trust No Bunny Discord Bot 

## 📌 Introduction

Welcome to the Trust No Bunny Discord Reward Bot! This bot integrates seamlessly with  Discord servers to provide periodic in-game rewards for the "Trust No Bunny" game. Players can claim these rewards directly from the Discord server and redeem them within the game. You are welcome to use it as a template for your own games!

## 🔥 Features

- **Periodic Rewards**: The bot will periodically send rewards in the form of enticing drops within specified channels in your server.
- **Database Connectivity**: The 'queries.ts' file provides a template for taking command inputs (such as claiming drops) and writing them to a database 
- **Customizable Reward Channels**: Server administrators can specify the channels where drops occur, giving them control over the reward distribution process.

## 🚀 Getting Started

### Prerequisites

- Ensure you have the required environment variables set up, including database credentials and a bot token.
- Make sure you have set up and configured your MySQL database to store and manage rewards, claims, and other related data.

### Running the Bot

1. Clone the repository to your local machine or server.
2. Create a MySQL database on your host server with the relevant schemas. This template uses three tables: a table for each Discord server, a table for handling drops, and a table for handling claims in game
3. Navigate to the root directory of the project.
4. Install all dependencies:```bash npm install```
5. ```npm start```

## 🎮 Usage
- Claiming a Reward: When a reward drops in a Discord channel, players can claim it by using the /claim <item> command.
- Setting Reward Channel: Server admins can set the channel for reward drops, ensuring that only the intended audience can claim the rewards.
