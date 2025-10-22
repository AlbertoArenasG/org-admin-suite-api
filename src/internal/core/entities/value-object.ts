import { recursivelyConvertToPrimitives } from '@src/common/utils';

export abstract class ValueObject<Props> {
  protected props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  public toPrimitives(): unknown {
    return recursivelyConvertToPrimitives(this.props);
  }
}
