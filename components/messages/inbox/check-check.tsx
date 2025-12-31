import {IconCheck, IconChecks} from '@tabler/icons-react';

type CheckCheckProps = {
  ifMyComment: boolean;
  read: boolean;
};

function CheckCheck({ifMyComment, read}: CheckCheckProps) {
  return ifMyComment ? (
    read ? (
      <IconChecks size="14" className="text-blue-500 absolute -bottom-1 right-3" />
    ) : (
      <IconCheck size="14" className="text-gray-500 absolute -bottom-1 right-3" />
    )
  ) : (
    <IconChecks size="14" className="text-blue-500 absolute -bottom-1 right-3" />
  );
}

export default CheckCheck;
