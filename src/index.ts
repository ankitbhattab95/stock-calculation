import { App } from './app';
import 'dotenv/config';

const server = new App();
const app = server.getApp()
app.listen(process.env.PORT, () => {
    console.log('> App server running on port ' + process.env.PORT);
});
