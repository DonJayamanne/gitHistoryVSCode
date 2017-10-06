// export class SocketServerManager {
//     private onSocketConnection(socket: SocketIO.Socket) {
//         this.clients.push(socket);
//         socket.on('disconnect', () => {
//             const index = this.clients.findIndex(sock => sock.id === socket.id);
//             if (index >= 0) {
//                 this.clients.splice(index, 1);
//             }
//         });
//         socket.on('clientExists', (data: { id: string }) => {
//             if (!this.responsePromises.has(data.id)) {
//                 return;
//             }
//             const def = this.responsePromises.get(data.id);
//             this.responsePromises.delete(data.id);
//             def!.resolve(true);
//         });
//         socket.on('settings.appendResults', (data: {}) => {
//             this.emit('settings.appendResults', data);
//         });
//         socket.on('clearResults', () => {
//             this.buffer = [];
//         });
//         socket.on('results.ack', () => {
//             this.buffer = [];
//         });
//         this.emit('connected');

//         // Someone is connected, send them the data we have
//         socket.emit('results', this.buffer);
//     }
// }
