import Command from "src/domain/Command";
import {ActivateFeatureCommand} from "src/domain/features/ActivateFeature";
import {DeactivateFeatureCommand} from "src/domain/features/DeactivateFeature";

export class Feature {

  public activateCommands: Array<Command<any>> = []
  public deactivateCommands: Array<Command<any>> = []

  constructor(
    public ident: string,
    public type: string,
    public name: string,
    public icon: string,
    public useIn: string[],
    public requires: string[] = []
  ) {
    this.activateCommands = [new ActivateFeatureCommand(this)]
    this.deactivateCommands = [new DeactivateFeatureCommand(this)]
  }

  setActivateCommands(cmds: Array<Command<any>>): Feature {
    this.activateCommands = cmds.concat(this.activateCommands)
    return this
  }

  setDeactivateCommands(cmds: Array<Command<any>>): Feature {
    this.deactivateCommands = cmds.concat(this.deactivateCommands)
    return this
  }
}
