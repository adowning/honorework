import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ThanhHoaWebSocket,  } from '../socket_server/core/thanh-hoa-web-socket.core';
import { ICashflowWebSocketData } from '..';
import { ServerWebSocket } from 'bun';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private chat_massages: any[] = [];
  private nextPlayerID = 1;
  private chat_ignoreList: Record<string, Record<string, boolean>> = {};
  private chat_userLastMessage: Record<string, number> = {};
  private chat_mode = 'normal';

  constructor(
    private readonly prisma: PrismaService,
    private readonly webSocket: ThanhHoaWebSocket
  ) {
    this.initializeWebSocketHandlers();
  }

  private initializeWebSocketHandlers() {
    // Register chat routes
    this.webSocket.group('/chat', (router) => {
      // Channel change handler
      router.addRoute('/channel/:channel', {
        onOpen: (ws, query, params) => this.handleChannelChange(ws, params.channel),
        onMessage: (ws, message) => this.handleChatMessage(ws, message, params.channel),
      });

      // General chat handler
      router.addRoute('', {
        onMessage: (ws, message) => this.handleChatMessage(ws, message, 'general'),
      });
    });

    // Load initial messages
    this.loadMessages().catch(err => {
      this.logger.error(`Failed to load messages: ${err.message}`);
    });

    // Set up periodic support messages
    setInterval(() => {
      this.sendSupportMessage();
    }, config.config_chat.support.cooldown * 1000);
  }

  private async handleChannelChange(ws: ServerWebSocket<ICashflowWebSocketData>, channel: string) {
    const user = ws.data.custom.user;
    if (!user) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    this.logger.debug(`${user.name}(${user.userid}) - Chat Changed to ${channel}`);
    
    this.webSocket.send(ws, JSON.stringify({
      type: 'chat',
      command: 'channel',
      channel: channel,
    }));

    // Send messages for the new channel
    this.chat_massages.forEach((item) => {
      if (item.channel === channel) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'chat',
          command: 'message',
          message: item,
          added: false,
        }));
      }
    });

    // Send greeting if configured
    if (config.config_chat.greeting) {
      this.otherMessages(config.config_chat.greeting, ws, false);
    }
  }

  private async handleChatMessage(ws: ServerWebSocket<ICashflowWebSocketData>, message: string | Buffer, channel: string) {
    const user = ws.data.custom.user;
    if (!user) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const messageStr = typeof message === 'string' ? message : message.toString();
    await this.chat_checkMessage(user, ws, messageStr, channel, false);
  }

  private async sendSupportMessage() {
    const message = config.config_chat.support.message;
    if (!message) return;

    const new_message = {
      type: 'system',
      message: message,
      time: new Date().getTime(),
    };

    this.webSocket.broadcast(JSON.stringify({
      type: 'chat',
      command: 'message',
      message: new_message,
      added: false,
    }));

    this.chat_massages.push(new_message);

    while (this.chat_massages.length > config.config_chat.max_messages) {
      this.chat_massages.shift();
    }
  }

  private async loadMessages(): Promise<void> {
    try {
      const messages = await this.prisma.chatMessage.findMany({
        where: { deleted: false },
        orderBy: { id: 'desc' },
        take: config.config_chat.max_messages,
        include: { user: true }
      });

      if (messages.length > 0) {
        this.nextPlayerID = messages[0].id + 1;

        for (const message of messages.reverse()) {
          const mentions = await this.getMentions(message.content);
          const newMessage = {
            type: 'player',
            id: message.id,
            userid: message.userId,
            name: message.user.name,
            avatar: message.user.avatar,
            rank: message.user.rank,
            level: calculateLevel(message.user.xp).level,
            message: message.content,
            channel: message.channel,
            mentions: mentions,
            time: message.timestamp.getTime(),
          };

          this.chat_massages.push(newMessage);
        }
      }
    } catch (error) {
      this.logger.error(`Error loading messages: ${error.message}`);
      throw error;
    }
  }

  private async chat_checkMessage(user, ws, message, channel, hide) {
    // ... (previous implementation remains the same until database operations)
//   async chat_checkMessage(user, socket, message, channel, hide) {
    if (message.trim().length <= 0) {
      socket.emit('message', {
        type: 'error',
        error: 'Error: Message is empty!',
      });
      return;
    }

    let res = null;

    if (chat_ignoreList[user.userid] === undefined) {
      chat_ignoreList[user.userid] = {};
    }

    this.logger.debug(
      `${user.name}(${user.userid}) - Chat Message | Message: ${message}`,
    );

    if ((res = /^\/help ([a-zA-Z0-9 ]*)/.exec(message))) {
      if (!(await this.chat_checkCommand(res[1], user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      // ... help command text messages remain the same ...
      otherMessages(text_message, socket, false);
    } 
    // ... other command checks remain similar until we get to database operations ...

    else if ((res = /^\/ignore ([a-z0-9_]*)/.exec(message))) {
      if (!(await this.chat_checkCommand('ignore', user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      try {
        const userToIgnore = await this.prisma.user.findUnique({
          where: { userid: res[1] },
        });

        if (!userToIgnore) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: Unknown user to ignore it!',
          });
          return;
        }

        if (res[1] == user.userid) {
          socket.emit('message', {
            type: 'error',
            error: "Error: You can't ignore yourself!",
          });
          return;
        }

        if (chat_ignoreList[user.userid][res[1]] !== undefined) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: This user is already ignored!',
          });
          return;
        }

        chat_ignoreList[user.userid][res[1]] = true;

        socket.emit('message', {
          type: 'chat',
          command: 'ignorelist',
          list: chat_ignoreList[user.userid],
        });

        chat_refreshMessages(user, socket);

        socket.emit('message', {
          type: 'info',
          info: `User ${userToIgnore.name} successfully ignored!`,
        });
      } catch (error) {
        this.logger.error(error);
        socket.emit('message', {
          type: 'error',
          error: 'An error occurred while processing your request',
        });
      }
    } 
    else if ((res = /^\/unignore ([a-z0-9_]*)/.exec(message))) {
      if (!(await this.chat_checkCommand('unignore', user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      try {
        const userToUnignore = await this.prisma.user.findUnique({
          where: { userid: res[1] },
        });

        if (!userToUnignore) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: Unknown user to unignore it!',
          });
          return;
        }

        if (res[1] == user.userid) {
          socket.emit('message', {
            type: 'error',
            error: "Error: You can't unignore yourself!",
          });
          return;
        }

        if (chat_ignoreList[user.userid][res[1]] === undefined) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: This user is not ignored!',
          });
          return;
        } else if (chat_ignoreList[user.userid][res[1]] == true) {
          delete chat_ignoreList[user.userid][res[1]];

          socket.emit('message', {
            type: 'chat',
            command: 'ignorelist',
            list: chat_ignoreList[user.userid],
          });

          chat_refreshMessages(user, socket);

          socket.emit('message', {
            type: 'info',
            info: `User ${userToUnignore.name} successfully unignored!`,
          });
        }
      } catch (error) {
        this.logger.error(error);
        socket.emit('message', {
          type: 'error',
          error: 'An error occurred while processing your request',
        });
      }
    } 
    else if ((res = /^\/setrank ([a-z0-9_]*) ([0-9]*)/.exec(message))) {
      if (!(await this.chat_checkCommand('setrank', user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      res = message.split(' ');

      const rankInList = chat_ranksList[
        chat_ranksList.map((x) => x.rank).indexOf(res[2].toLowerCase())
      ];

      if (rankInList === undefined) {
        socket.emit('message', {
          type: 'error',
          error: 'Error: Invalid rank!',
        });
        return;
      }

      try {
        const userToUpdate = await this.prisma.user.findUnique({
          where: { userid: res[1] },
        });

        if (!userToUpdate) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: Unknown user!',
          });
          return;
        }

        if (userToUpdate.rank == res[1].toLowerCase()) {
          socket.emit('message', {
            type: 'error',
            error: 'Error: User have already this rank!',
          });
          return;
        }

        await this.prisma.user.update({
          where: { userid: res[1] },
          data: { rank: rankInList.code },
        });

        socket.emit('message', {
          type: 'info',
          info: `${userToUpdate.name} was changed to ${rankInList.rank}`,
        });

        this.server.to(res[1]).emit('message', {
          type: 'info',
          info: `Your rank was changed to ${rankInList.rank} by ${user.name}`,
        });
      } catch (error) {
        this.logger.error(error);
        socket.emit('message', {
          type: 'error',
          error: 'An error occurred while updating user rank',
        });
      }
    }
    else if ((res = /^\/maintenance ([a-zA-Z0-9- ]*)/.exec(message))) {
      if (!(await this.chat_checkCommand('maintenance', user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      try {
        await this.prisma.info.updateMany({
          data: {
            maintenance: true,
            maintenance_message: res[1],
          },
        });

        socket.emit('message', {
          type: 'success',
          success: 'Maintenance status setted!',
        });

        this.server.emit('message', {
          type: 'reload',
        });
      } catch (error) {
        this.logger.error(error);
        socket.emit('message', {
          type: 'error',
          error: 'Failed to set maintenance mode',
        });
      }
    }
    else if ((res = /^\/unmaintenance/.exec(message))) {
      if (!(await this.chat_checkCommand('unmaintenance', user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      try {
        await this.prisma.info.updateMany({
          data: {
            maintenance: false,
          },
        });

        socket.emit('message', {
          type: 'success',
          success: 'Maintenance status setted!',
        });

        this.server.emit('message', {
          type: 'reload',
        });
      } catch (error) {
        this.logger.error(error);
        socket.emit('message', {
          type: 'error',
          error: 'Failed to unset maintenance mode',
        });
      }
    }
    else if ((res = /^\/givecoins ([a-z0-9_]*) ([0-9.]*)/.exec(message))) {
      if (!(await this.chat_checkCommand('givecoins', user.rank))) {
        socket.emit('message', {
          type: 'error',
          error: 'Invalid command name provided!',
        });
        return;
      }

      if (res[1] == user.userid && user.rank != 100) {
        socket.emit('message', {
          type: 'error',
          error: "Error: You can't give coins to yourself!",
        });
        return;
      }

      verifyFormatAmount(res[2], async (err1, amount) => {
        if (err1) {
          socket.emit('message', {
            type: 'error',
            error: err1.message,
          });
          return;
        }

        try {
          const receiver = await this.prisma.user.findUnique({
            where: { userid: res[1] },
          });

          if (!receiver) {
            socket.emit('message', {
              type: 'error',
              error: 'Error: Unknown receiver!',
            });
            return;
          }

          await this.prisma.$transaction([
            this.prisma.userTransaction.create({
              data: {
                userid: res[1],
                service: 'change_balance',
                amount: amount,
                time: Math.floor(Date.now() / 1000),
              },
            }),
            this.prisma.user.update({
              where: { userid: res[1] },
              data: { balance: { increment: amount } },
            }),
          ]);

          this.server.to(res[1]).emit('message', {
            type: 'info',
            info: `You got ${getFormatAmountString(amount)} coins from ${user.name}!`,
          });

          socket.emit('message', {
            type: 'info',
            info: `You gave ${getFormatAmountString(amount)} coins to ${receiver.name}.`,
          });

          getBalance(res[1]);
        } catch (error) {
          this.logger.error(error);
          socket.emit('message', {
            type: 'error',
            error: 'Failed to give coins',
          });
        }
      });
    }
    // Example conversion for /deletemessage command
    else if ((res = /^\/deletemessage ([0-9]*)/.exec(message))) {
      if (!(await this.chat_checkCommand('deletemessage', user.rank))) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: 'Invalid command name provided!',
        }));
        return;
      }

      if (isNaN(Number(res[1]))) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: 'Error: Invalid message id!',
        }));
        return;
      }

      const message_id = parseInt(res[1]);

      try {
        await this.prisma.chatMessage.update({
          where: { id: message_id },
          data: { deleted: true },
        });

        const messageIndex = this.chat_massages.findIndex((item) => item.id == message_id);
        if (messageIndex !== -1) {
          this.chat_massages.splice(messageIndex, 1);
        }

        this.webSocket.broadcast(JSON.stringify({
          type: 'chat',
          command: 'delete',
          id: message_id,
        }));

        this.logger.log(`Message ${message_id} marked as deleted`);
      } catch (error) {
        this.logger.error(`Error deleting message ${message_id}: ${error.message}`);
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: `Error: Failed to delete message ${message_id}!`,
        }));
      }
    }
    // ... (convert other commands similarly)
  }
    // Converted chat_writeMessage
    private async chat_writeMessage(user, ws, message, channel) {
      if (
        this.chat_mode == 'pause' &&
        user.rank != 1 &&
        user.rank != 2 &&
        user.rank != 100
      ) {
        return;
      }

      if (this.chat_mode == 'normal') {
        if (
          this.chat_userLastMessage[user.userid] + config.config_chat.cooldown_massage >
          Math.floor(Date.now() / 1000)
        ) {
          return;
        }
      }
      this.chat_userLastMessage[user.userid] = Math.floor(Date.now() / 1000);

      message = this.chat_safeMessage(message).trim();

      if (message.length == 0) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: "Error: You can't send a empty message.",
        }));
        return;
      }

      if (message.length > 200) message = message.substr(0, 200);

      if (user.restrictions.mute >= Math.floor(Date.now() / 1000) || user.restrictions.mute == -1) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error:
            'Error: You are restricted to use our chat. The restriction expires, ' +
            (user.restrictions.mute == -1
              ? 'never'
              : makeDate(new Date(user.restrictions.mute * 1000))) +
            '.',
        }));
        return;
      }

      if (!config.config_chat.channels.includes(channel)) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: 'Invalid channel!',
        }));
        return;
      }

      if (user.xp < 500) {
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: `You need to be atleast level 1 to chat.`,
        }));
        return;
      }

      const mentions = await this.chat_getMentions(message);

      try {
        const newMessage = await this.prisma.chatMessage.create({
          data: {
            userId: user.userid,
            content: message,
            channel: channel,
            timestamp: new Date(),
            deleted: false,
          },
          include: {
            user: true,
          },
        });

        const new_message = {
          type: 'player',
          id: newMessage.id,
          userid: user.userid,
          name: user.name,
          avatar: user.avatar,
          rank: user.rank,
          level: calculateLevel(user.xp).level,
          message: message,
          channel: channel,
          mentions: mentions,
          time: newMessage.timestamp.getTime(),
        };

        this.webSocket.broadcast(JSON.stringify({
          type: 'chat',
          command: 'message',
          message: new_message,
          added: true,
        }));

        this.chat_massages.push(new_message);

        while (this.chat_massages.length > config.config_chat.max_messages) {
          this.chat_massages.shift();
        }
      } catch (error) {
        this.logger.error(error);
        this.webSocket.send(ws, JSON.stringify({
          type: 'error',
          error: 'Failed to send message',
        }));
      }
    }

    // Converted otherMessages function
    private otherMessages(message: string, ws: ServerWebSocket<ICashflowWebSocketData> | Server, keep: boolean) {
      const new_message = {
        type: 'system',
        message: message,
        time: new Date().getTime(),
      };

      if (ws instanceof Server) {
        // Broadcast to all clients
        this.webSocket.broadcast(JSON.stringify({
          type: 'chat',
          command: 'message',
          message: new_message,
          added: false,
        }));
      } else {
        // Send to specific client
        this.webSocket.send(ws, JSON.stringify({
          type: 'chat',
          command: 'message',
          message: new_message,
          added: false,
        }));
      }

      if (keep) {
        this.chat_massages.push(new_message);

        while (this.chat_massages.length > config.config_chat.max_messages) {
          this.chat_massages.shift();
        }
      }
    }

    // ... (other helper functions remain similar with socket.io replaced with webSocket)
}

// import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { config } from 'process';
// import { async } from 'rxjs';
// import { any, array } from 'zod';
// import { chat_commandsList, chat_commandsRank, chat_ignoreList, chat_ranksList, chat_mode, chat_userLastMessage, chat_massages } from '../handlers/chat.constants';

// @Injectable()
// export class ChatService {
//   constructor(private readonly prisma: PrismaService) {}
//   private readonly logger = new Logger(ChatService.name);

//   @WebSocketServer()
//   server: Server;

//   // ... other existing code ...

//   async loadMessages(): Promise<void> {
//     try {
//       const messages = await this.prisma.chatMessage.findMany({
//         where: { deleted: false },
//         orderBy: { id: 'desc' },
//         take: config.config_chat.max_messages,
//         include: { user: true }
//       });

//       if (messages.length > 0) {
//         this.nextPlayerID = messages[0].id + 1;

//         messages.reverse().forEach(async (message) => {
//           const mentions = await this.getMentions(message.content);
//           const newMessage = {
//             type: 'player',
//             id: message.id,
//             userid: message.userId,
//             name: message.user.name,
//             avatar: message.user.avatar,
//             rank: message.user.rank,
//             level: calculateLevel(message.user.xp).level,
//             message: message.content,
//             channel: message.channel,
//             mentions: mentions,
//             time: message.timestamp,
//           };

//           this.chat_massages.push(newMessage);
//         });
//       }
//     } catch (error) {
//       this.logger.error(`Error loading messages: ${error.message}`);
//       throw error;
//     }
//   }

// chat_loadMessages();

// setInterval(function(){
// 	otherMessages(config.config_chat.support.message, io.sockets, true)
// }, config.config_chat.support.cooldown * 1000)


//  chat_loadChannel(user, socket, channel){
// 	logger.debug(user.name + '(' + user.userid + ') - Chat Changed to ' + channel);
	
// 	socket.emit('message', {
// 		type: 'chat',
// 		command: 'channel',
// 		channel: channel
// 	});
	
// 	chat_massages.forEach(function(item){
// 		if(item.type == 'player'){
// 			if(item.channel == channel){
// 				var message = {
// 					type: item.type,
// 					id: item.id,
// 					userid: item.userid,
// 					name: item.name,
// 					avatar: item.avatar,
// 					rank: item.rank,
// 					level: item.level,
// 					message: item.message,
// 					channel: item.channel,
// 					mentions: item.mentions,
// 					time: item.time
// 				}
				
// 				socket.emit('message', {
// 					type: 'chat',
// 					command: 'message',
// 					message: message,
// 					added: false
// 				});
// 			}
// 		} else if(item.type == 'system'){
// 			var message = {
// 				type: item.type,
// 				message: item.message,
// 				time: item.time
// 			}
			
// 			socket.emit('message', {
// 				type: 'chat',
// 				command: 'message',
// 				message: message,
// 				added: false
// 			});
// 		}
// 	});
	
// 	otherMessages(config.config_chat.greeting, socket, false);
// }

//  chat_refreshMessages(user, socket){
// 	socket.emit('message', {
// 		type: 'chat',
// 		command: 'clean'
// 	});
	
// 	chat_massages.forEach(function(item){
// 		if(item.type == 'player'){
// 			var message = {
// 				type: item.type,
// 				id: item.id,
// 				userid: item.userid,
// 				name: item.name,
// 				avatar: item.avatar,
// 				rank: item.rank,
// 				level: item.level,
// 				message: item.message,
// 				channel: item.channel,
// 				mentions: item.mentions,
// 				time: item.time
// 			}
// 		} else if(item.type == 'system'){
// 			var message = {
// 				type: item.type,
// 				message: item.message,
// 				time: item.time
// 			}
// 		}
		
// 		socket.emit('message', {
// 			type: 'chat',
// 			command: 'message',
// 			message: message,
// 			added: false
// 		});
// 	});
// }

//  otherMessages(message, socket, keep){
// 	var new_message = {
// 		type: 'system',
// 		message: message,
// 		time: new Date().getTime()
// 	}
	
// 	socket.emit('message', {
// 		type: 'chat',
// 		command: 'message',
// 		message: new_message,
// 		added: false
// 	});
	
// 	if(keep){
// 		chat_massages.push(new_message);
		
// 		while(chat_massages.length > config.config_chat.max_messages) chat_massages.shift();
// 	}
// }


//   async chat_checkCommand(command: string, rank: number): Promise<boolean> {
//     if (chat_commandsList[command] === undefined) return false;
//     if (!chat_commandsRank[rank].includes(command)) return false;
//     return true;
//   }

//   async chat_checkMessage(user, socket, message, channel, hide) {
//     if (message.trim().length <= 0) {
//       socket.emit('message', {
//         type: 'error',
//         error: 'Error: Message is empty!',
//       });
//       return;
//     }

//     let res = null;

//     if (chat_ignoreList[user.userid] === undefined) {
//       chat_ignoreList[user.userid] = {};
//     }

//     this.logger.debug(
//       `${user.name}(${user.userid}) - Chat Message | Message: ${message}`,
//     );

//     if ((res = /^\/help ([a-zA-Z0-9 ]*)/.exec(message))) {
//       if (!(await this.chat_checkCommand(res[1], user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       // ... help command text messages remain the same ...
//       otherMessages(text_message, socket, false);
//     } 
//     // ... other command checks remain similar until we get to database operations ...

//     else if ((res = /^\/ignore ([a-z0-9_]*)/.exec(message))) {
//       if (!(await this.chat_checkCommand('ignore', user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       try {
//         const userToIgnore = await this.prisma.user.findUnique({
//           where: { userid: res[1] },
//         });

//         if (!userToIgnore) {
//           socket.emit('message', {
//             type: 'error',
//             error: 'Error: Unknown user to ignore it!',
//           });
//           return;
//         }

//         if (res[1] == user.userid) {
//           socket.emit('message', {
//             type: 'error',
//             error: "Error: You can't ignore yourself!",
//           });
//           return;
//         }

//         if (chat_ignoreList[user.userid][res[1]] !== undefined) {
//           socket.emit('message', {
//             type: 'error',
//             error: 'Error: This user is already ignored!',
//           });
//           return;
//         }

//         chat_ignoreList[user.userid][res[1]] = true;

//         socket.emit('message', {
//           type: 'chat',
//           command: 'ignorelist',
//           list: chat_ignoreList[user.userid],
//         });

//         chat_refreshMessages(user, socket);

//         socket.emit('message', {
//           type: 'info',
//           info: `User ${userToIgnore.name} successfully ignored!`,
//         });
//       } catch (error) {
//         this.logger.error(error);
//         socket.emit('message', {
//           type: 'error',
//           error: 'An error occurred while processing your request',
//         });
//       }
//     } 
//     else if ((res = /^\/unignore ([a-z0-9_]*)/.exec(message))) {
//       if (!(await this.chat_checkCommand('unignore', user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       try {
//         const userToUnignore = await this.prisma.user.findUnique({
//           where: { userid: res[1] },
//         });

//         if (!userToUnignore) {
//           socket.emit('message', {
//             type: 'error',
//             error: 'Error: Unknown user to unignore it!',
//           });
//           return;
//         }

//         if (res[1] == user.userid) {
//           socket.emit('message', {
//             type: 'error',
//             error: "Error: You can't unignore yourself!",
//           });
//           return;
//         }

//         if (chat_ignoreList[user.userid][res[1]] === undefined) {
//           socket.emit('message', {
//             type: 'error',
//             error: 'Error: This user is not ignored!',
//           });
//           return;
//         } else if (chat_ignoreList[user.userid][res[1]] == true) {
//           delete chat_ignoreList[user.userid][res[1]];

//           socket.emit('message', {
//             type: 'chat',
//             command: 'ignorelist',
//             list: chat_ignoreList[user.userid],
//           });

//           chat_refreshMessages(user, socket);

//           socket.emit('message', {
//             type: 'info',
//             info: `User ${userToUnignore.name} successfully unignored!`,
//           });
//         }
//       } catch (error) {
//         this.logger.error(error);
//         socket.emit('message', {
//           type: 'error',
//           error: 'An error occurred while processing your request',
//         });
//       }
//     } 
//     else if ((res = /^\/setrank ([a-z0-9_]*) ([0-9]*)/.exec(message))) {
//       if (!(await this.chat_checkCommand('setrank', user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       res = message.split(' ');

//       const rankInList = chat_ranksList[
//         chat_ranksList.map((x) => x.rank).indexOf(res[2].toLowerCase())
//       ];

//       if (rankInList === undefined) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Error: Invalid rank!',
//         });
//         return;
//       }

//       try {
//         const userToUpdate = await this.prisma.user.findUnique({
//           where: { userid: res[1] },
//         });

//         if (!userToUpdate) {
//           socket.emit('message', {
//             type: 'error',
//             error: 'Error: Unknown user!',
//           });
//           return;
//         }

//         if (userToUpdate.rank == res[1].toLowerCase()) {
//           socket.emit('message', {
//             type: 'error',
//             error: 'Error: User have already this rank!',
//           });
//           return;
//         }

//         await this.prisma.user.update({
//           where: { userid: res[1] },
//           data: { rank: rankInList.code },
//         });

//         socket.emit('message', {
//           type: 'info',
//           info: `${userToUpdate.name} was changed to ${rankInList.rank}`,
//         });

//         this.server.to(res[1]).emit('message', {
//           type: 'info',
//           info: `Your rank was changed to ${rankInList.rank} by ${user.name}`,
//         });
//       } catch (error) {
//         this.logger.error(error);
//         socket.emit('message', {
//           type: 'error',
//           error: 'An error occurred while updating user rank',
//         });
//       }
//     }
//     else if ((res = /^\/maintenance ([a-zA-Z0-9- ]*)/.exec(message))) {
//       if (!(await this.chat_checkCommand('maintenance', user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       try {
//         await this.prisma.info.updateMany({
//           data: {
//             maintenance: true,
//             maintenance_message: res[1],
//           },
//         });

//         socket.emit('message', {
//           type: 'success',
//           success: 'Maintenance status setted!',
//         });

//         this.server.emit('message', {
//           type: 'reload',
//         });
//       } catch (error) {
//         this.logger.error(error);
//         socket.emit('message', {
//           type: 'error',
//           error: 'Failed to set maintenance mode',
//         });
//       }
//     }
//     else if ((res = /^\/unmaintenance/.exec(message))) {
//       if (!(await this.chat_checkCommand('unmaintenance', user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       try {
//         await this.prisma.info.updateMany({
//           data: {
//             maintenance: false,
//           },
//         });

//         socket.emit('message', {
//           type: 'success',
//           success: 'Maintenance status setted!',
//         });

//         this.server.emit('message', {
//           type: 'reload',
//         });
//       } catch (error) {
//         this.logger.error(error);
//         socket.emit('message', {
//           type: 'error',
//           error: 'Failed to unset maintenance mode',
//         });
//       }
//     }
//     else if ((res = /^\/givecoins ([a-z0-9_]*) ([0-9.]*)/.exec(message))) {
//       if (!(await this.chat_checkCommand('givecoins', user.rank))) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid command name provided!',
//         });
//         return;
//       }

//       if (res[1] == user.userid && user.rank != 100) {
//         socket.emit('message', {
//           type: 'error',
//           error: "Error: You can't give coins to yourself!",
//         });
//         return;
//       }

//       verifyFormatAmount(res[2], async (err1, amount) => {
//         if (err1) {
//           socket.emit('message', {
//             type: 'error',
//             error: err1.message,
//           });
//           return;
//         }

//         try {
//           const receiver = await this.prisma.user.findUnique({
//             where: { userid: res[1] },
//           });

//           if (!receiver) {
//             socket.emit('message', {
//               type: 'error',
//               error: 'Error: Unknown receiver!',
//             });
//             return;
//           }

//           await this.prisma.$transaction([
//             this.prisma.userTransaction.create({
//               data: {
//                 userid: res[1],
//                 service: 'change_balance',
//                 amount: amount,
//                 time: Math.floor(Date.now() / 1000),
//               },
//             }),
//             this.prisma.user.update({
//               where: { userid: res[1] },
//               data: { balance: { increment: amount } },
//             }),
//           ]);

//           this.server.to(res[1]).emit('message', {
//             type: 'info',
//             info: `You got ${getFormatAmountString(amount)} coins from ${user.name}!`,
//           });

//           socket.emit('message', {
//             type: 'info',
//             info: `You gave ${getFormatAmountString(amount)} coins to ${receiver.name}.`,
//           });

//           getBalance(res[1]);
//         } catch (error) {
//           this.logger.error(error);
//           socket.emit('message', {
//             type: 'error',
//             error: 'Failed to give coins',
//           });
//         }
//       });
//     }
// }
//     // ... other command implementations ...

//     async chat_writeMessage(user, socket, message, channel) {
//       if (
//         chat_mode == 'pause' &&
//         user.rank != 1 &&
//         user.rank != 2 &&
//         user.rank != 100
//       )
//         return;

//       if (chat_mode == 'normal')
//         if (
//           chat_userLastMessage[user.userid] + config.config_chat.cooldown_massage >
//           Math.floor(Date.now() / 1000)
//         )
//           return;
//       chat_userLastMessage[user.userid] = Math.floor(Date.now() / 1000);

//       message = chat_safeMessage(message).trim();

//       if (message.length == 0) {
//         socket.emit('message', {
//           type: 'error',
//           error: "Error: You can't send a empty message.",
//         });
//         return;
//       }

//       if (message.length > 200) message = message.substr(0, 200);

//       if (user.restrictions.mute >= Math.floor(Date.now() / 1000) || user.restrictions.mute == -1) {
//         socket.emit('message', {
//           type: 'error',
//           error:
//             'Error: You are restricted to use our chat. The restriction expires, ' +
//             (user.restrictions.mute == -1
//               ? 'never'
//               : makeDate(new Date(user.restrictions.mute * 1000))) +
//             '.',
//         });
//         return;
//       }

//       if (!config.config_chat.channels.includes(channel)) {
//         socket.emit('message', {
//           type: 'error',
//           error: 'Invalid channel!',
//         });
//         return;
//       }

//       if (user.xp < 500) {
//         return socket.emit('message', {
//           type: 'error',
//           error: `You need to be atleast level 1 to chat.`,
//         });
//       }

//       const mentions = await this.chat_getMentions(message);

//       try {
//         const newMessage = await this.prisma.chatMessage.create({
//           data: {
//             userId: user.userid,
//             content: message,
//             channel: channel,
//             timestamp: new Date(),
//             deleted: false,
//           },
//           include: {
//             user: true,
//           },
//         });

//         const new_message = {
//           type: 'player',
//           id: newMessage.id,
//           userid: user.userid,
//           name: user.name,
//           avatar: user.avatar,
//           rank: user.rank,
//           level: calculateLevel(user.xp).level,
//           message: message,
//           channel: channel,
//           mentions: mentions,
//           time: newMessage.timestamp.getTime(),
//         };

//         this.server.emit('message', {
//           type: 'chat',
//           command: 'message',
//           message: new_message,
//           added: true,
//         });

//         chat_massages.push(new_message);

//         while (chat_massages.length > config.config_chat.max_messages)
//           chat_massages.shift();
//       } catch (error) {
//         this.logger.error(error);
//         socket.emit('message', {
//           type: 'error',
//           error: 'Failed to send message',
//         });
//       }
//     }

//      chat_getMentions(message): Promise<any[]> {
//       const reg = /\B@([a-f\d]+)/gi;
//       let mentions = message.match(reg);

//       const array = [];

//       if (!mentions) return array;
//       if (mentions.length <= 0) return array;

//       for (let i = 0; i < mentions.length; i++)
//         mentions[i] = mentions[i].replace('@', '');

//       try {
//         const users = await this.prisma.user.findMany({
//           where: {
//             userid: { in: mentions },
//           },
//         });

//         users.forEach((user) => {
//           array.push({
//             mention: '@' + user.userid,
//             name: '@' + user.name,
//           });
//         });

//         return array;
//       } catch (error) {
//         this.logger.error(error);
//         return array;
//       }
//     }

//     chat_safeMessage(message) {
//       function chat_replaceTag(tag) {
//         return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[tag] || tag;
//       }

//       return message.replace(/[&<>]/g, chat_replaceTag);
//     }
// }