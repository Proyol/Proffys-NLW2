import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
//permite a comunicação do front-end com o back-end que rodam em servidores diferentes  
app.use(cors());
app.use(express.json()); //Fazer a conversão de objetos json para que o express consiga entender
app.use(routes);


app.listen(3333);