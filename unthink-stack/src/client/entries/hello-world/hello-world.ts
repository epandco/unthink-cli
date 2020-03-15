import { component } from 'riot';
import HelloWorld from './hello-world.riot';

document.addEventListener('DOMContentLoaded', () => {
  component(HelloWorld)(document.querySelector('hello-world') || document.body);
});
