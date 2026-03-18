// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { dataSource } from './datasource';

dataSource
	.initialize()
	.then(async () => {
		console.log('Database connected successfully');
		
		await dataSource.synchronize(true);
		
		console.log('Database synchronized successfully!');
		console.log('All entities have been synced to the database.');
		
		await dataSource.destroy();
		process.exit(0);
	})
	.catch((error) => {
		console.error('Error during database synchronization:', error);
		process.exit(1);
	});
