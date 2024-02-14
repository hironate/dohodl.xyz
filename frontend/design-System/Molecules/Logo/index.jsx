import { Image } from '../../Atom/Image';
import { Button } from '../../Atom/Button';
const Logo = ({ className, url, logoLight = false }) => {
  return (
    <Button link={url} customClassName={' '}>
      {logoLight ? (
        <Image
          src={'/images/hodlLogoLight.png'}
          alt="logo"
          className={className}
        />
      ) : (
        <Image
          src={'/images/hodlLogoDark.png'}
          alt="logo"
          className={className}
        />
      )}
    </Button>
  );
};

export default Logo;
