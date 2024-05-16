import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {Feature} from "src/features/src/models/Feature";


export class DeactivateFeatureCommand implements Command<any> {

  constructor(
    public feature: Feature) {
  }


  async execute(): Promise<ExecutionResult<any>> {
    usePermissionsStore().deactivateFeature(this.feature.ident.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.feature.ident.toLowerCase()} was deactivated`))
  }

}

DeactivateFeatureCommand.prototype.toString = function cmdToString() {
  return `DeactivateFeatureCommand: {feature=${this.feature.ident}}`;
};
