// src/utils/migrationCommands.ts
import {
  runFullMigration,
  migrateUsers,
  migrateMoods,
  migrateRequests,
  verifyMigration,
} from "./migrateData";

// Global migration commands for console
const migrationCommands = {
  // Full migration
  migrate: async () => {
    console.log("🚀 Starting full migration...");
    try {
      await runFullMigration();
      console.log("✅ Full migration completed!");
    } catch (error) {
      console.error("❌ Migration failed:", error);
    }
  },

  // Individual migrations
  migrateUsers: async () => {
    console.log("👥 Migrating users...");
    try {
      await migrateUsers();
      console.log("✅ Users migration completed!");
    } catch (error) {
      console.error("❌ Users migration failed:", error);
    }
  },

  migrateMoods: async () => {
    console.log("😊 Migrating moods...");
    try {
      await migrateMoods();
      console.log("✅ Moods migration completed!");
    } catch (error) {
      console.error("❌ Moods migration failed:", error);
    }
  },

  migrateRequests: async () => {
    console.log("📨 Migrating requests...");
    try {
      await migrateRequests();
      console.log("✅ Requests migration completed!");
    } catch (error) {
      console.error("❌ Requests migration failed:", error);
    }
  },

  // Verification
  verify: async () => {
    console.log("🔍 Verifying migration...");
    try {
      await verifyMigration();
      console.log("✅ Verification completed!");
    } catch (error) {
      console.error("❌ Verification failed:", error);
    }
  },

  // Help
  help: () => {
    console.log("📖 Available Migration Commands:");
    console.log("");
    console.log("🚀 window.migration.migrate()       - Run full migration");
    console.log("👥 window.migration.migrateUsers()   - Migrate users only");
    console.log("😊 window.migration.migrateMoods()   - Migrate moods only");
    console.log(
      "📨 window.migration.migrateRequests() - Migrate requests only"
    );
    console.log("🔍 window.migration.verify()        - Verify migration");
    console.log("📖 window.migration.help()          - Show this help");
    console.log("");
    console.log("Example usage: window.migration.migrate()");
  },
};

// Make available globally in development
if (__DEV__) {
  (global as any).window = (global as any).window || {};
  (global as any).window.migration = migrationCommands;

  console.log("🔧 Migration commands available!");
  console.log("Type: window.migration.help() for usage");
}

export default migrationCommands;
