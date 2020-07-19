import 'reflect-metadata';
import debug from 'debug';
import http from 'http';
import app from '../app';
import config from '../config';

/*
  declarations
*/
const logger = debug('app:server');
/*
  set PORT on express
*/
app.set('port', config.app.port);

/*
  setup HTTP server
*/
const server = http.createServer(app);

server.listen(config.app.port);

server.on('error', (error: Error) => { throw error; });
server.on('listening', () => {
  const addr = server.address();
  logger('listening on ' + (
    typeof addr === 'string' ?
      'pipe ' + addr : 'port ' + addr?.port
  ));
});