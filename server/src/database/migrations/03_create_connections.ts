import Knex from 'knex';

//armazenar se o usuário tentou entrar em contato com o professor
export async function up(knex: Knex){
    return knex.schema.createTable('connections', table => {
        table.increments('id').primary();

        table.integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE') 
            .onDelete('CASCADE');

        //Horario que o aluno tentou entrar em contato com o professor
        table.timestamp('created_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable();
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('connections');
}