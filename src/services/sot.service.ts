/**
 * SOT (Status Origination Tree) Service
 * This file contains SOT-specific business logic
 */
import { SOTData } from "../types/sot.types.js";
import { getAppContract } from "./app.service.js";
import { GetAppContractParams, ObjectDefinition } from "../types/app.types.js";
/**
 * Updates the app contract with new or updated SOT data.
 * Note: This function is for internal processing only.
 * Use createSOTWithContract() for complete SOT creation with API updates.
 */
export async function createSOT(
  baseUrl: string,
  tenantName: string,
  appId: string,
  sotData: SOTData[]
): Promise<void> {
  try {
    const contract = await getAppContract({ baseUrl, tenantName, appId });
    for (const sot of sotData) {
      // Find object in contract
      const object = contract.objects.find(
        (obj: ObjectDefinition) => obj.slug === sot.object_slug
      );

      if (!object) {
        console.warn(`Object with slug "${sot.object_slug}" not found.`);
        continue;
      }

      // Generate widgets if origination_type is page and widgets not present
      if (sot.origination_type === "page" && !sot.widgets) {
        // sot.widgets = generateWidgets(
        //   object.type,
        //   sot.origination?.type || "record"
        // );
      }

      // Ensure object has a `sots` array
      if (!("sots" in object)) {
        (object as any).sots = [];
      }

      const sots = (object as any).sots as SOTData[];

      // Replace existing SOT with same ID or push new one
      const existingIndex = sots.findIndex((s) => s.id === sot.id);

      if (existingIndex !== -1) {
        sots[existingIndex] = sot;
      } else {
        sots.push(sot);
      }
    }

    // Note: We would need to implement an updateAppContract function
    // or use the existing API endpoint to save the updated contract
  } catch (error: any) {
    throw new Error(`Failed to create SOT: ${error.message}`);
  }
}

/**
 * Service function that integrates with the app.service createSotData function
 */
export async function createSOTWithContract(
  baseUrl: string,
  tenantName: string,
  appId: string,
  sotData: SOTData[]
): Promise<any> {
  try {
    // Get the existing contract first
    const existingContract = await getAppContract({
      baseUrl,
      tenantName,
      appId,
    });

    if (!existingContract) {
      throw new Error("Could not fetch app contract");
    }

    // Use the existing createSotData function from app.service.js
    const { createSotData } = await import("../utils/api.js");

    return await createSotData(
      baseUrl,
      tenantName,
      appId,
      sotData,
      existingContract
    );
  } catch (error: any) {
    throw new Error(`Failed to create SOT with contract: ${error.message}`);
  }
}
