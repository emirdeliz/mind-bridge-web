import React from 'react';

export interface IconOptions {
  alert?: boolean;
  alignJustify?: boolean;
  arrowBack?: boolean;
  bank?: boolean;
  calendar?: boolean;
  cartArrowDown?: boolean;
  close?: boolean;
  check?: boolean;
  desktop?: boolean;
  down?: boolean;
  downOpen?: boolean;
  email?: boolean;
  gamepad?: boolean;
  leftOpen?: boolean;
  maintenance?: boolean;
  menu?: boolean;
  pdfDouble?: boolean;
  power?: boolean;
  rightOpen?: boolean;
  search?: boolean;
  cog?: boolean;
  tooltipMessage?: boolean;
  trashEmpty?: boolean;
  up?: boolean;
  upload?: boolean;
  upOpen?: boolean;
  user?: boolean;
  users?: boolean;
  infoCircle?: boolean;
  barcode?: boolean;
  transactions?: boolean;
  home?: boolean;
  userPermission?: boolean;
  secret?: boolean;
  edit?: boolean;
  pencil?: boolean;
  folderOpen?: boolean;
  heartbeat?: boolean;
  briefcase?: boolean;
  listAlt?: boolean;
  book?: boolean;
  handPointerO?: boolean;
  chatEmpty?: boolean;
  aiAgent?: boolean;
  angleDown?: boolean;
  client?: boolean;
  chat?: boolean;
  artifact?: boolean;
  okCircle?: boolean;
  spin?: boolean;
  error?: boolean;
  history?: boolean;
  download?: boolean;
  floppy?: boolean;
  docs?: boolean;
  document?: boolean;
  eye?: boolean;
  eyeOff?: boolean;
  dualScreen?: boolean;
  docAdd?: boolean;
  linkExt?: boolean;
  microphone?: boolean;
  stop?: boolean;
}

export interface IconProps extends IconOptions {
  className?: string;
  spinning?: boolean;
  circled?: boolean;
  bordered?: boolean;
  bgColored?: boolean;
  xxs?: boolean;
  xs?: boolean;
  sm?: boolean;
  nm?: boolean;
  xLg?: boolean;
  xxxLg?: boolean;
  rotate90?: boolean;
  bgColor?: string;
  // Cores
  white?: boolean;
  black?: boolean;
  red?: boolean;
  green?: boolean;
  blue?: boolean;
  gray?: boolean;
  // Margens e padding
  p2?: boolean;
  p3?: boolean;
  p4?: boolean;
  p5?: boolean;
  m1?: boolean;
  m2?: boolean;
  m3?: boolean;
  m4?: boolean;
  m5?: boolean;
}

const getIcon = ({
  alert,
  alignJustify,
  arrowBack,
  bank,
  barcode,
  calendar,
  cartArrowDown,
  close,
  check,
  desktop,
  down,
  downOpen,
  email,
  gamepad,
  maintenance,
  menu,
  power,
  leftOpen,
  infoCircle,
  pdfDouble,
  rightOpen,
  search,
  cog,
  tooltipMessage,
  upload,
  upOpen,
  up,
  transactions,
  user,
  users,
  trashEmpty,
  home,
  userPermission,
  secret,
  edit,
  pencil,
  folderOpen,
  heartbeat,
  briefcase,
  listAlt,
  book,
  handPointerO,
  chatEmpty,
  aiAgent,
  angleDown,
  client,
  chat,
  artifact,
  okCircle,
  spin,
  error,
  history,
  download,
  floppy,
  docs,
  document,
  eye,
  eyeOff,
  dualScreen,
  docAdd,
  linkExt,
  microphone,
  stop,
}: IconOptions) => {
  switch (true) {
    case alert:
      return 'alert';
    case alignJustify:
      return 'align-justify';
    case arrowBack:
      return 'arrow-back';
    case bank:
      return 'bank';
    case barcode:
      return 'barcode';
    case calendar:
      return 'calendar';
    case cartArrowDown:
      return 'cart-arrow-down';
    case close:
      return 'close';
    case check:
      return 'check';
    case desktop:
      return 'desktop';
    case down:
      return 'down';
    case download:
      return 'download';
    case downOpen:
      return 'down-open';
    case email:
      return 'email';
    case gamepad:
      return 'gamepad';
    case leftOpen:
      return 'left-open';
    case infoCircle:
      return 'info-circle';
    case maintenance:
      return 'maintenance';
    case menu:
      return 'menu';
    case pdfDouble:
      return 'pdf-double';
    case power:
      return 'power';
    case rightOpen:
      return 'right-open';
    case search:
      return 'search';
    case cog:
      return 'cog';
    case tooltipMessage:
      return 'tooltip-message';
    case trashEmpty:
      return 'trash-empty';
    case transactions:
      return 'transactions';
    case upload:
      return 'upload';
    case up:
      return 'up';
    case upOpen:
      return 'up-open';
    case user:
      return 'user';
    case users:
      return 'users';
    case home:
      return 'home';
    case userPermission:
      return 'user-permission';
    case secret:
      return 'secret';
    case edit:
      return 'edit';
    case pencil:
      return 'pencil';
    case folderOpen:
      return 'folder-open';
    case heartbeat:
      return 'heartbeat';
    case briefcase:
      return 'briefcase';
    case listAlt:
      return 'list-alt';
    case book:
      return 'book';
    case handPointerO:
      return 'hand-pointer-o';
    case chatEmpty:
      return 'chat-empty';
    case aiAgent:
      return 'ai-agent';
    case angleDown:
      return 'angle-down';
    case client:
      return 'client';
    case chat:
      return 'chat';
    case artifact:
      return 'artifact';
    case okCircle:
      return 'ok-circle';
    case spin:
      return 'spin';
    case error:
      return 'error';
    case history:
      return 'history';
    case download:
      return 'download';
    case floppy:
      return 'floppy';
    case docs:
      return 'docs';
    case document:
      return 'document';
    case eye:
      return 'eye';
    case eyeOff:
      return 'eye-off';
    case dualScreen:
      return 'dual-screen';
    case docAdd:
      return 'doc-add';
    case linkExt:
      return 'link-ext';
    case microphone:
      return 'microphone';
    case stop:
      return 'stop';
  }
  return 'power';
};

export const Icon = ({ className, spinning, ...props }: IconProps) => {
  const icon = getIcon(props);
  const sizeClass = props.xxs
    ? 'text-xs'
    : props.xs
      ? 'text-sm'
      : props.sm
        ? 'text-base'
        : props.nm
          ? 'text-lg'
          : props.xLg
            ? 'text-xl'
            : props.xxxLg
              ? 'text-2xl'
              : undefined;
  const colorClass = props.white
    ? 'text-white'
    : props.black
      ? 'text-black'
      : props.red
        ? 'text-red-400'
        : props.green
          ? 'text-emerald-400'
          : props.blue
            ? 'text-mb-primary'
            : props.gray
              ? 'text-mb-muted'
              : undefined;
  const iconClasses = [
    'inline-flex',
    'align-middle',
    'leading-none',
    sizeClass,
    colorClass,
    className,
    spinning && 'animate-spin',
    props.rotate90 && 'rotate-90',
  ]
    .filter(Boolean)
    .join(' ');

  // Don't pass {...props} to DOM to avoid invalid boolean attribute warnings
  return <span data-testid='icon' className={`${iconClasses} icon-${icon}`} />;
};

Icon.Alert = (props: IconProps) => <Icon {...props} alert />;
Icon.AlignJustify = (props: IconProps) => <Icon {...props} alignJustify />;
Icon.ArrowBack = (props: IconProps) => <Icon {...props} arrowBack />;
Icon.Bank = (props: IconProps) => <Icon {...props} bank />;
Icon.Barcode = (props: IconProps) => <Icon {...props} barcode />;
Icon.Calendar = (props: IconProps) => <Icon {...props} calendar />;
Icon.CartArrowDown = (props: IconProps) => <Icon {...props} cartArrowDown />;
Icon.Close = (props: IconProps) => <Icon {...props} close />;
Icon.Check = (props: IconProps) => <Icon {...props} check />;
Icon.Desktop = (props: IconProps) => <Icon {...props} desktop />;
Icon.Down = (props: IconProps) => <Icon {...props} upOpen />;
Icon.Download = (props: IconProps) => <Icon {...props} download />;
Icon.DownOpen = (props: IconProps) => <Icon {...props} downOpen />;
Icon.Email = (props: IconProps) => <Icon {...props} email />;
Icon.Gamepad = (props: IconProps) => <Icon {...props} gamepad />;
Icon.LeftOpen = (props: IconProps) => <Icon {...props} leftOpen />;
Icon.InfoCircle = (props: IconProps) => <Icon {...props} infoCircle />;
Icon.Maintenance = (props: IconProps) => <Icon {...props} maintenance />;
Icon.Menu = (props: IconProps) => <Icon {...props} menu />;
Icon.PdfDouble = (props: IconProps) => <Icon {...props} pdfDouble />;
Icon.Power = (props: IconProps) => <Icon {...props} power />;
Icon.RightOpen = (props: IconProps) => <Icon {...props} rightOpen />;
Icon.Search = (props: IconProps) => <Icon {...props} search />;
Icon.Cog = (props: IconProps) => <Icon {...props} cog />;
Icon.TooltipMessage = (props: IconProps) => <Icon {...props} tooltipMessage />;
Icon.Upload = (props: IconProps) => <Icon {...props} upload />;
Icon.Up = (props: IconProps) => <Icon {...props} upload />;
Icon.UpOpen = (props: IconProps) => <Icon {...props} upOpen />;
Icon.Transactions = (props: IconProps) => <Icon {...props} transactions />;
Icon.TrashEmpty = (props: IconProps) => <Icon {...props} trashEmpty />;
Icon.User = (props: IconProps) => <Icon {...props} user />;
Icon.Users = (props: IconProps) => <Icon {...props} users />;
Icon.Home = (props: IconProps) => <Icon {...props} home />;
Icon.UserPermission = (props: IconProps) => <Icon {...props} userPermission />;
Icon.Secret = (props: IconProps) => <Icon {...props} secret />;
Icon.Edit = (props: IconProps) => <Icon {...props} edit />;
Icon.Pencil = (props: IconProps) => <Icon {...props} pencil />;
Icon.FolderOpen = (props: IconProps) => <Icon {...props} folderOpen />;
Icon.Heartbeat = (props: IconProps) => <Icon {...props} heartbeat />;
Icon.Briefcase = (props: IconProps) => <Icon {...props} briefcase />;
Icon.ListAlt = (props: IconProps) => <Icon {...props} listAlt />;
Icon.Book = (props: IconProps) => <Icon {...props} book />;
Icon.HandPointerO = (props: IconProps) => <Icon {...props} handPointerO />;
Icon.ChatEmpty = (props: IconProps) => <Icon {...props} chatEmpty />;
Icon.AiAgent = (props: IconProps) => <Icon {...props} aiAgent />;
Icon.AngleDown = (props: IconProps) => <Icon {...props} angleDown />;
Icon.Client = (props: IconProps) => <Icon {...props} client />;
Icon.Chat = (props: IconProps) => <Icon {...props} chat />;
Icon.Artifact = (props: IconProps) => <Icon {...props} artifact />;
Icon.OkCircle = (props: IconProps) => <Icon {...props} okCircle />;
Icon.Spin = (props: IconProps) => <Icon {...props} spin />;
Icon.Error = (props: IconProps) => <Icon {...props} error />;
Icon.History = (props: IconProps) => <Icon {...props} history />;
Icon.Download = (props: IconProps) => <Icon {...props} download />;
Icon.Floppy = (props: IconProps) => <Icon {...props} floppy />;
Icon.Docs = (props: IconProps) => <Icon {...props} docs />;
Icon.Document = (props: IconProps) => <Icon {...props} document />;
Icon.Eye = (props: IconProps) => <Icon {...props} eye />;
Icon.EyeOff = (props: IconProps) => <Icon {...props} eyeOff />;
Icon.DualScreen = (props: IconProps) => <Icon {...props} dualScreen />;
Icon.DocAdd = (props: IconProps) => <Icon {...props} docAdd />;
Icon.LinkExt = (props: IconProps) => <Icon {...props} linkExt />;
Icon.Microphone = (props: IconProps) => <Icon {...props} microphone />;
Icon.Stop = (props: IconProps) => <Icon {...props} stop />;
