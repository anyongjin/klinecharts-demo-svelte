<script lang="ts">
  const icons = {
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  interface AlertProps {
    type: 'info' | 'success' | 'warning' | 'error';
    text: string;
  }

  let {type = 'info', text = ''}: AlertProps = $props();
</script>

<div role="alert" class="alert alert-{type} fixed mx-auto max-w-md">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0 stroke-current"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d={icons[type]} />
  </svg>
  <span>{text}</span>
</div>

<style>
  .alert {
    display: flex;
    align-items: center;
    padding: 1rem;
    margin: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* 添加一些位置样式来堆叠多个alert */
  div[role="alert"] {
    z-index: 50;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
</style>