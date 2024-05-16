import Command from "src/domain/Command";
import {ExecutionResult} from "src/domain/ExecutionResult";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {Feature} from "src/features/models/Feature";


export class ActivateFeatureCommand implements Command<any> {

  constructor(
    public feature: Feature) {
  }


  async execute(): Promise<ExecutionResult<any>> {
    usePermissionsStore().activateFeature(this.feature.ident.toLowerCase())
    return Promise.resolve(
      new ExecutionResult(
        "done",
        `Feature ${this.feature.ident.toLowerCase()} was activated`))
  }

}

ActivateFeatureCommand.prototype.toString = function cmdToString() {
  return `ActivateFeatureCommand: {feature=${this.feature.ident}}`;
};
