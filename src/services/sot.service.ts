import { SOTData } from "../types/sot.types.js";
import { getAppContract, updateAppContract } from "./app.service.js";

/**
 * Updates the app contract with new or updated SOT data.
 */
export async function createSOT(
  baseUrl: string,
  tenantName: string,
  appId: string,
  sotData: SOTData[]
): Promise<void> {
  try {
    const contract = await getAppContract(baseUrl, tenantName, appId);

    for (const sot of sotData) {
      // Find object in contract
      const object = contract.objects.find(
        (obj) => obj.slug === sot.object_slug
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

    // Save updated contract
    await updateAppContract(baseUrl, tenantName, appId, contract);
  } catch (error: any) {
    throw new Error(`Failed to create SOT: ${error.message}`);
  }
}
