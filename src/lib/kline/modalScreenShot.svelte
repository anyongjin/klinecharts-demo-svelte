<script lang="ts">
  import Modal from "./modal.svelte"
  
  let { show = $bindable(), url = $bindable() } = $props();

  function handleConfirm(from: string) {
    if (from === 'confirm') {
      const a = document.createElement('a');
      a.download = 'screenshot';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    show = false;
  }
</script>

<Modal title="Screenshot" width={540} bind:show={show} click={handleConfirm}>
  <img 
    src={url} 
    alt="screenshot" 
    class="w-[500px] mt-5"
  />
</Modal>