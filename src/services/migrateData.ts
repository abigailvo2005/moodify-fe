// src/scripts/migrateData.ts
import axios from "axios";
import { firestoreService } from "../services/firestoreService";
import { COLLECTIONS } from "./firebase";
import { API_BASE_URL, API_BASE_URL_V2 } from "@env";
import { ConnectingRequest, Mood, User } from "../types";

// Use Expo environment variables
const MOCK_API_BASE = API_BASE_URL;
const MOCK_API_BASE_V2 = API_BASE_URL;

interface MigrationLog {
  collection: string;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

class SchemaMigration {
  private logs: MigrationLog[] = [];

  private createLog(collection: string): MigrationLog {
    const log: MigrationLog = {
      collection,
      totalRecords: 0,
      successCount: 0,
      failureCount: 0,
      errors: [],
      startTime: new Date(),
    };
    this.logs.push(log);
    return log;
  }

  // Helper to generate referral code
  private generateReferralCode(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }

  // Helper to safely convert to boolean
  private toBoolean(value: any, defaultValue: boolean = false): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "true" || value === "1";
    }
    if (typeof value === "number") return value === 1;
    return defaultValue;
  }

  // Generic migration method
  private async migrateCollection<T>(
    mockEndpoint: string,
    firestoreCollection: string,
    transformer: (data: any) => Partial<T>,
    apiBase: string = MOCK_API_BASE
  ): Promise<void> {
    const log = this.createLog(firestoreCollection);

    try {
      console.log(`🚀 Starting migration for ${firestoreCollection}...`);

      const response = await axios.get(`${apiBase}/${mockEndpoint}`);
      const data = Array.isArray(response.data)
        ? response.data
        : [response.data];

      log.totalRecords = data.length;
      console.log(`📥 Found ${data.length} records in ${firestoreCollection}`);

      for (let i = 0; i < data.length; i++) {
        try {
          const record = data[i];
          console.log(
            `📝 Processing ${firestoreCollection} record ${i + 1}:`,
            record
          );

          // Remove MockAPI metadata
          const { id: mockId, createdAt: mockCreatedAt, ...rawData } = record;

          // Transform data using provided transformer
          const transformedData = transformer(rawData);

          // Remove undefined values
          const cleanedData = Object.entries(transformedData).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) {
                (acc as Partial<T>)[key as keyof T] = value as T[keyof T];
              }
              return acc;
            },
            {} as any
          );

          console.log(`📤 Storing cleaned data:`, cleanedData);

          // Create in Firestore
          await firestoreService.create(firestoreCollection, cleanedData);

          log.successCount++;
          console.log(
            `✅ Migrated ${firestoreCollection} record ${i + 1}/${data.length}`
          );
        } catch (error) {
          log.failureCount++;
          const errorMsg = `Failed to migrate ${firestoreCollection} record ${
            i + 1
          }: ${error.message}`;
          log.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
          console.error(`❌ Problem record:`, data[i]);
        }
      }

      log.endTime = new Date();
      console.log(`🎉 Migration completed for ${firestoreCollection}!`);
      console.log(
        `Success: ${log.successCount}, Failures: ${log.failureCount}`
      );
    } catch (error) {
      log.endTime = new Date();
      let errorMsg: string;
      if (error instanceof Error) {
        errorMsg = `Migration failed for ${firestoreCollection}: ${error.message}`;
      } else {
        errorMsg = `Migration failed for ${firestoreCollection}: ${JSON.stringify(error)}`;
      }
      log.errors.push(errorMsg);
      console.error(`💥 ${errorMsg}`);
    }
  }

  // Users migration with correct schema
  async migrateUsers(): Promise<void> {
    await this.migrateCollection<User>(
      "users",
      COLLECTIONS.USERS,
      (userData): Partial<User> => ({
        name:
          userData.name ||
          userData.displayName ||
          userData.username ||
          "Unknown User",
        username: userData.username || `user_${Date.now()}`,
        password: userData.password || "temp_password_change_me",
        dob:
          userData.dob ||
          userData.dateOfBirth ||
          userData.birthday ||
          "1990-01-01",
        referralCode: userData.referralCode || this.generateReferralCode(),
        friends: Array.isArray(userData.friends) ? userData.friends : [],
        // Note: token is excluded from migration
      })
    );
  }

  // Moods migration with correct schema
  async migrateMoods(): Promise<void> {
    await this.migrateCollection<Mood>(
      "mood",
      COLLECTIONS.MOODS,
      (moodData): Partial<Mood> => ({
        userId: moodData.userId || moodData.user_id || "unknown",
        mood:
          moodData.mood || moodData.moodType || moodData.feeling || "neutral",
        description:
          moodData.description || moodData.note || moodData.text || "",
        reason: moodData.reason || moodData.cause || moodData.trigger || "",
        date:
          moodData.date ||
          moodData.timestamp ||
          moodData.created_at ||
          new Date().toISOString(),
        isPrivate: this.toBoolean(
          moodData.isPrivate ??
            moodData.private ??
            moodData.visibility === "private",
          false
        ),
      })
    );
  }

  // Requests migration with correct schema
  async migrateRequests(): Promise<void> {
    // Try V2 API first, fallback to V1
    let apiBase = MOCK_API_BASE_V2;
    let apiVersion = "V2";

    try {
      if (!MOCK_API_BASE_V2) {
        throw new Error("V2 API not configured");
      }

      // Test V2 API
      await axios.get(`${MOCK_API_BASE_V2}/requests`, { timeout: 5000 });
      console.log("✅ Using V2 API for requests");
    } catch (error) {
      console.log("⚠️ V2 API failed, falling back to V1...");
      apiBase = MOCK_API_BASE;
      apiVersion = "V1";
    }

    await this.migrateCollection<ConnectingRequest>(
      "requests",
      COLLECTIONS.REQUESTS,
      (requestData): Partial<ConnectingRequest> => {
        const isAccepted = this.toBoolean(
          requestData.isAccepted ??
            requestData.accepted ??
            requestData.status === "accepted",
          false
        );

        return {
          senderId:
            requestData.senderId ||
            requestData.fromUserId ||
            requestData.from_user_id ||
            requestData.sender_id ||
            "unknown",
          receiverId:
            requestData.receiverId ||
            requestData.toUserId ||
            requestData.to_user_id ||
            requestData.receiver_id ||
            "unknown",
          isAccepted,
          status: requestData.status || (isAccepted ? "accepted" : "pending"),
          date:
            requestData.createdAt ||
            requestData.created_at ||
            requestData.timestamp ||
            new Date().toISOString(),
        };
      },
      apiBase
    );

    console.log(`📡 Requests migrated using ${apiVersion} API`);
  }

  // Run full migration
  async runFullMigration(): Promise<void> {
    console.log("🔄 Starting Schema-Aware Migration...");
    console.log("📋 Target Schemas: User, Mood, ConnectingRequest");
    this.logs = [];

    try {
      await this.migrateUsers();
      await this.migrateMoods();
      await this.migrateRequests();

      this.printMigrationSummary();
    } catch (error) {
      console.error("💥 Full migration failed:", error);
      this.printMigrationSummary();
    }
  }

  // Print detailed summary
  private printMigrationSummary(): void {
    console.log("\n📊 SCHEMA MIGRATION SUMMARY");
    console.log("=".repeat(70));

    let totalRecords = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    this.logs.forEach((log) => {
      const duration = log.endTime
        ? ((log.endTime.getTime() - log.startTime.getTime()) / 1000).toFixed(1)
        : "N/A";

      console.log(`\n📁 ${log.collection.toUpperCase()}`);
      console.log(`   📊 Total Records: ${log.totalRecords}`);
      console.log(`   ✅ Successful: ${log.successCount}`);
      console.log(`   ❌ Failed: ${log.failureCount}`);
      console.log(`   ⏱️ Duration: ${duration}s`);
      console.log(
        `   📈 Success Rate: ${
          log.totalRecords > 0
            ? ((log.successCount / log.totalRecords) * 100).toFixed(1)
            : 0
        }%`
      );

      if (log.errors.length > 0) {
        console.log(`   🚨 Sample Errors:`);
        log.errors.slice(0, 3).forEach((error) => {
          console.log(`     • ${error}`);
        });
      }

      totalRecords += log.totalRecords;
      totalSuccess += log.successCount;
      totalFailed += log.failureCount;
    });

    console.log("\n🎯 OVERALL RESULTS");
    console.log(`   📊 Total Records: ${totalRecords}`);
    console.log(`   ✅ Total Success: ${totalSuccess}`);
    console.log(`   ❌ Total Failed: ${totalFailed}`);
    console.log(
      `   📈 Overall Success Rate: ${
        totalRecords > 0 ? ((totalSuccess / totalRecords) * 100).toFixed(1) : 0
      }%`
    );
    console.log("=".repeat(70));

    if (totalSuccess === totalRecords && totalRecords > 0) {
      console.log("🎉 Perfect migration! All records migrated successfully!");
    }
  }
}

// Export instances and functions
export const schemaMigration = new SchemaMigration();

export const migrateUsersWithSchema = () => schemaMigration.migrateUsers();
export const migrateMoodsWithSchema = () => schemaMigration.migrateMoods();
export const migrateRequestsWithSchema = () =>
  schemaMigration.migrateRequests();
export const runSchemaMigration = () => schemaMigration.runFullMigration();

// Make available in console
if (__DEV__) {
  (global as any).schemaMigration = {
    full: runSchemaMigration,
    users: migrateUsersWithSchema,
    moods: migrateMoodsWithSchema,
    requests: migrateRequestsWithSchema,
  };

  console.log("🔧 Schema Migration Available:");
  console.log(
    "- schemaMigration.full()     // Full migration with correct schema"
  );
  console.log("- schemaMigration.users()    // Users with User interface");
  console.log("- schemaMigration.moods()    // Moods with Mood interface");
  console.log(
    "- schemaMigration.requests() // Requests with ConnectingRequest interface"
  );
}
