import Command from "src/domain/Command";
import {ActivateFeatureCommand} from "src/features/commands/ActivateFeature";
import {DeactivateFeatureCommand} from "src/features/commands/DeactivateFeature";

export class Feature {

  public activateCommands: Array<Command<any>> = []
  public deactivateCommands: Array<Command<any>> = []
  public imageWidth: string = "250px";

  constructor(
    public ident: string,
    public type: string,
    public name: string,
    public description: string,
    public icon: string,
    public image: string,
    public useIn: string[],
    public requires: string[] = [],
    public needsAccount: boolean = false
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

  setImageWidth(width: string) {
    this.imageWidth = width
    return this;
  }
}
