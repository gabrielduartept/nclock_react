import { forwardRef, useState } from 'react';
import { Button } from 'react-bootstrap';

// Define a interface para as propriedades do CustomOutlineButton
interface CustomOutlineButtonProps {
  onClick?: () => void;
  icon?: string;
  iconSize?: string;
}

export const CustomOutlineButton = forwardRef<HTMLButtonElement, CustomOutlineButtonProps>(
  ({ onClick, icon, iconSize }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    // Define o estilo base para o botão
    const baseStyle = {
      borderColor: '#0050a0',
      color: '#0050a0',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      height: '30px',
      width: '30px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    // Define o estilo do botão ao passar o mouse
    const hoverStyle = {
      ...baseStyle,
      backgroundColor: '#0050a0',
      color: '#ffffff',
    };

    // Define o estilo do ícone
    const iconStyle = {
      fontSize: iconSize,
    };

    return (
      <Button
        ref={ref}
        style={isHovered ? hoverStyle : baseStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {icon && <i className={`bi ${icon}`} style={iconStyle}></i>}
      </Button>
    );
  }
);
