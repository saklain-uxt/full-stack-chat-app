import mongoose from 'mongoose';
export const connectDB= async()=>{
      try{
            const connect= await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected:',connect.connection.host);

      }catch(e){
            console.error('Error connecting to MongoDB:',e.message);

      }

}