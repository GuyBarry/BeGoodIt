import PageHeader from '../../PageHeader';

interface Props {
  onGetInspired?: () => void;
}

export default function FittingRoomHeader({ onGetInspired: _ }: Props) {
  return (
    <PageHeader title="Fitting Room" subtitle="Create your perfect look" />
  );
}
