import { Modal as NativeModal, type ModalProps } from 'react-native';

// Match the app's supported iOS orientations. The native phone default is portrait only.
const appOrientations: NonNullable<ModalProps['supportedOrientations']> = [
  'portrait', 'portrait-upside-down', 'landscape-left', 'landscape-right',
];

export function AdaptiveModal({ supportedOrientations = appOrientations, ...props }: ModalProps) {
  return <NativeModal {...props} supportedOrientations={supportedOrientations} />;
}
