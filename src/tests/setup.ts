import 'reflect-metadata';
import '../di';

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);
