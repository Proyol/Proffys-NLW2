import {Request, Response} from 'express'
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHoursToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

export default class ClassesController {
    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;

        //usar o transaction para realizar a inserção dos dados ao mesmo tempo
        //assim caso ocorra um erro na inserção de algum dado ele não defaz a operação daqueles que já foram inseridos
        const trx = await db.transaction();

        try {
            //inserir informações na tabela usuário
            const insertedUsersIds = await trx('users').insert({
                name: name,
                avatar: avatar,
                whatsapp: whatsapp,
                bio: bio
            });

            const user_id = insertedUsersIds[0];

            //inserir informações na tabela classes
            const insertedClassesIds = await trx('classes').insert({
                subject: subject,
                cost: cost,
                user_id: user_id
            });

            const class_id = insertedClassesIds[0];

            //inserir informações na tabela de cronograma
            //converter o horário das aulas em minutos
            const class_schedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id: class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes(scheduleItem.from),
                    to: convertHourToMinutes(scheduleItem.to)
                }
            })

            await trx('class_schedule').insert(class_schedule);

            //fazer as alterações do banco 
            await trx.commit();

            return response.status(201).send();
        } catch (err) { //Informar caso ocorra algum erro nas funções acima
            //desfazer algumas alterações caso foram feitas nas funções acima
            await trx.rollback();

            return response.status(400).json({
                error: 'Unexpected error while creating new classes'
            })
        }
    }
    
    //Listar as aulas por filtros
    async index(request: Request, response: Response){
        const filters = request.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        //Caso não for informado nenhum filtro
        if(!filters.week_day || !filters.subject || !filters.time){
            return response.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        //Query para pesquisar as classes
        const classes = await db('classes')
            .whereExists(function(){
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id`=`classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day`=??',[Number(week_day)])//passar vetor dos dias da semana para fazer a query
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return response.json(classes);
    }
}