# Instruções de workflow (git/branches)

- Antes de qualquer `git commit`/`git push`, verificar se a branch de trabalho
  ainda existe (local e remota). O usuário exclui a branch remota assim que
  aceita/mergeia o PR correspondente.
- Se a branch não existir mais (foi excluída após aceitar o PR): não tentar
  reaproveitá-la. Criar uma nova branch a partir do `main` atualizado
  (`git fetch origin main && git checkout -b <nova-branch> origin/main`) e
  seguir o trabalho normalmente a partir dela.
- Cada implementação nova (não relacionada a um PR ainda aberto) deve ir em
  uma branch e PR próprios — não empilhar em cima de uma branch/PR já aceito.