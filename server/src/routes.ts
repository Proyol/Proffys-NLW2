import express from 'express';
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = express.Router();

const classesController = new ClassesController();
const connectionsController = new ConnectionsController();

//criar aula
routes.post('/classes', classesController.create);

//listar aulas
routes.get('/classes', classesController.index)


//total de conexões  
routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);
export default routes;