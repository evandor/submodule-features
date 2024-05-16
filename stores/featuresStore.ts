import {defineStore} from "pinia";
import {computed, ref} from "vue";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";
import {LocalStorage} from "quasar";
import {AppFeatures, FeatureIdent} from "src/models/AppFeatures";

export const useFeaturesStore = defineStore('features', () => {

  let storage = null as unknown as FeaturesPersistence

  // related to browser permissions
  const grantedOptionalPermissions = ref<string[] | undefined>([])
  const grantedOptionalOrigins = ref<string[] | undefined>([])
  const permissions = ref<chrome.permissions.Permissions | undefined>(undefined)

  // related to tabsets permissions
  const activeFeatures = ref<string[]>(LocalStorage.getItem('ui.activeFeatures') as string[] || [])

  async function initialize(ps: FeaturesPersistence) {
    console.debug(" ...initializing features store")
    storage = ps
    await storage.init()
    await load()
  }

  async function load() {
    activeFeatures.value = await storage.getActiveFeatures()
    // if (process.env.MODE !== 'bex') {
    //   return
    // }
    if (chrome) { // issues in vitest where chrome is not defined
      // @ts-ignore
      permissions.value = await chrome.permissions.getAll()
      if (permissions.value) {
        grantedOptionalPermissions.value = permissions.value.permissions ? permissions.value.permissions : []
        grantedOptionalOrigins.value = permissions.value.origins ? permissions.value.origins : []
      }
    }
  }

  const hasFeature = computed(() => {
    return (feature: FeatureIdent): boolean => {
      if (feature === FeatureIdent.SIDE_PANEL) {
        // @ts-ignore
        return chrome.sidePanel !== undefined
      }
      const appFeature = new AppFeatures().getFeature(feature)
      if (appFeature) {
        return activeFeatures.value.indexOf(feature.toLowerCase()) >= 0
      }
      return false
    }
  })


  return {
    initialize,
    hasFeature
  }
})

