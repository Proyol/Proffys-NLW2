//função para converter horas em minutos para a tabela schedules
export default function convertHourToMinutes(time: string){

    //dividir a string a patir do :. Ex: 8:00 -> [8,0]
    const [hour, minutes] = time.split(':').map(Number);
    const timeInMinutes = (hour*60) + minutes;

    return timeInMinutes
}