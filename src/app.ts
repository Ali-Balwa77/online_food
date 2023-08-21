import express  from "express";
import App from './services/expressApp';
import dbConnection from './services/database';
import { PORT } from "./config";

const startServer = async () => {

    const app = express();

    await App(app);
    
    await dbConnection();

    app.listen(PORT, () => {
        console.log(`Server is running on port:${PORT}`);
    })

}

startServer();