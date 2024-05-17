import {defineStore} from "pinia";
import {computed, ref} from "vue";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";
import {LocalStorage} from "quasar";
import {AppFeatures, FeatureIdent} from "src/models/AppFeatures";
import {useSuggestionsStore} from "src/suggestions/stores/suggestionsStore";
import {StaticSuggestionIdent, Suggestion} from "src/suggestions/models/Suggestion";
import {useCommandExecutor} from "src/services/CommandExecutor";
import {CreateSpecialTabsetCommand, SpecialTabsetIdent} from "src/domain/tabsets/CreateSpecialTabset";
import {TabsetType} from "src/tabsets/models/Tabset";
import {useTabsetService} from "src/services/TabsetService2";
import {useUtils} from "src/services/Utils";

const {sendMsg} = useUtils()

export const useFeaturesStore = defineStore('features', () => {

  let storage = null as unknown as FeaturesPersistence

  // related to browser permissions
  const grantedOptionalPermissions = ref<string[] | undefined>([])
  const grantedOptionalOrigins = ref<string[] | undefined>([])
  const permissions = ref<chrome.permissions.Permissions | undefined>(undefined)

  // related to tabsets permissions
  const activeFeatures = ref<string[]>(LocalStorage.getItem('ui.activeFeatures') as string[] || [])

  async function initialize(ps: FeaturesPersistence) {
    console.debug(" ...initializing features store", ps?.getServiceName())
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

  // TODO really a getter?
  const activateFeature = computed(() => {
    return (feature: string): void => {
      if (storage && activeFeatures.value.indexOf(feature) < 0) {
        activeFeatures.value.push(feature)
        storage.saveActiveFeatures(activeFeatures.value)

        if (FeatureIdent.SPACES.toLowerCase() === feature) {
          useSuggestionsStore().inactivateSuggestion(Suggestion.getStaticSuggestion(StaticSuggestionIdent.TRY_SPACES_FEATURE))
        }
        if (FeatureIdent.BACKUP.toLowerCase() === feature) {
          useCommandExecutor().executeFromUi(new CreateSpecialTabsetCommand(SpecialTabsetIdent.BACKUP, TabsetType.SPECIAL))
        }
        if (FeatureIdent.HELP.toLowerCase() === feature) {
          useCommandExecutor().executeFromUi(new CreateSpecialTabsetCommand(SpecialTabsetIdent.HELP, TabsetType.SPECIAL))
        } else if (FeatureIdent.IGNORE.toLowerCase() === feature) {
          //useSuggestionsStore().removeSuggestion(StaticSuggestionIdent.TRY_TAB_DETAILS_FEATURE)
          useCommandExecutor().executeFromUi(new CreateSpecialTabsetCommand(SpecialTabsetIdent.IGNORE, TabsetType.SPECIAL))
        }
        sendMsg('feature-activated', {feature: feature})
      }
    }
  })

  function deactivateRecursive(feature: string) {
    console.log("deactivate recursive: ", feature)
    const deactivatedIdent = feature.toUpperCase() as FeatureIdent
    const appFeature = new AppFeatures().getFeature(deactivatedIdent)

    //console.log("deactivating normal feature", feature)
    const index = activeFeatures.value.indexOf(feature)
    if (index >= 0) {
      if (FeatureIdent.HELP.toLowerCase() === feature) {
        useTabsetService().deleteTabset("HELP")
        // Notify.create({
        //     color: 'warning',
        //     message: "The Help pages have been deleted"
        // })
      }
      activeFeatures.value.splice(index, 1)
      storage.saveActiveFeatures(activeFeatures.value)
      sendMsg('feature-deactivated', {feature: feature})
      new AppFeatures().getFeatures().forEach(f => {
        if (f.requires.findIndex((r: string) => {
          return r === deactivatedIdent.toString()
        }) >= 0) {
          console.log("need to deactivate as well:", f)
          deactivateRecursive(f.ident.toLowerCase())
        }
      })
      //console.log("deactivated", feature, activeFeatures.value)
    }

  }

  const deactivateFeature = computed(() => {
    return (feature: string): void => {
      //console.log("deactivating", feature)
      deactivateRecursive(feature)
    }
  })

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
    hasFeature,
    activateFeature,
    deactivateFeature
  }
})

