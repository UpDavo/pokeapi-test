import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const Custom = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
  },
  components: {
    card: {
      colorScheme: {
        light: {
          root: {
            background: '{white.0}',
            color: '{surface.0}',
          },
          subtitle: {
            color: '{surface.0}',
          },
        },
      },
    },
    menubar: {
      colorScheme: {
        light: {
          root: {
            background: '{stone.900}',
            color: '{surface.0}',
          },
        },
      },
    },
  },
});

export default Custom;
