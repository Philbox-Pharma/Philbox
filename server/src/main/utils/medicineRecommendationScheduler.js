import cron from 'node-cron';
import adminMedicineRecommendationsService from '../modules/admin/features/dashboard_management/medicine_recommendations/services/medicineRecommendations.service.js';

class MedicineRecommendationScheduler {
  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  start() {
    if (this.isRunning) {
      console.log('Medicine recommendation scheduler is already running');
      return;
    }

    this.task = cron.schedule('10 0 * * *', async () => {
      console.log('Running medicine recommendation scheduler...');

      try {
        const result =
          await adminMedicineRecommendationsService.refreshAllDailyRecommendations(
            8,
            1000
          );
        console.log(
          `✅ Medicine recommendations refreshed for ${result.refreshedCustomers} customers`
        );
      } catch (error) {
        console.error(
          'Error refreshing daily medicine recommendations:',
          error
        );
      }
    });

    this.isRunning = true;
    console.log(
      '✅ Medicine recommendation scheduler started (runs daily at 00:10)'
    );
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log('❌ Medicine recommendation scheduler stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: '10 0 * * * (Daily at 00:10)',
    };
  }
}

export default new MedicineRecommendationScheduler();
