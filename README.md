# Intranet infrastructure

Application SvelteKit de supervision de l'intranet.

## Journalisation

Le service de journalisation est integre a l'application. Le serveur intranet se connecte en SSH aux machines declarees dans `services`, lit les journaux locaux, les normalise puis les stocke dans `service_logs`. La page `/logs?tab=services` affiche les entrees aux administrateurs.

Sources collectees :

- DNS : `/var/log/syslog`, lignes `named` ou `bind9`.
- LDAP : `/var/log/syslog`, lignes `slapd`.
- Nextcloud : `/var/log/nginx/error.log` et erreurs HTTP `>= 400` de `/var/log/nginx/access.log`.
- Proxmox : `journalctl` sur `pvedaemon`, `pveproxy`, `pvestatd`, `pve-cluster` et `corosync`.

Variables utiles :

- `SSH_LOG_USER` : utilisateur SSH de lecture des logs, par defaut `intranet-monitor`.
- `SSH_KEY_PATH` : cle privee utilisee par le serveur intranet.
- `SSH_LOG_LINES` : nombre de lignes lues par cycle.
- `LOG_COLLECT_INTERVAL_SECONDS` : frequence de collecte.
- `NEXTCLOUD_LOG_HOST` et `PROXMOX_LOG_HOST` : hote SSH si la cible de supervision est une URL.
- `LOG_HOST_<SERVICE_ID>_<CHECK_TYPE>` : surcharge par service, par exemple `LOG_HOST_SRV_NEXTCLOUD_NEXTCLOUD`.

Initialisation des services :

```sh
npm run db:seed-services
```

## Installation de l'acces logs

Sur chaque machine a collecter, creer l'utilisateur et installer la cle publique du serveur intranet :

```sh
sudo useradd --system --create-home --shell /bin/sh intranet-monitor
sudo install -d -o intranet-monitor -g intranet-monitor -m 700 /home/intranet-monitor/.ssh
echo '<CLE_PUBLIQUE_INTRANET>' | sudo tee /home/intranet-monitor/.ssh/authorized_keys >/dev/null
sudo chown intranet-monitor:intranet-monitor /home/intranet-monitor/.ssh/authorized_keys
sudo chmod 600 /home/intranet-monitor/.ssh/authorized_keys
```

Pour DNS et LDAP :

```sh
sudo usermod -aG adm intranet-monitor
sudo systemctl restart ssh
```

Pour Nextcloud avec Nginx :

```sh
sudo usermod -aG adm intranet-monitor
sudo setfacl -m u:intranet-monitor:r /var/log/nginx/access.log /var/log/nginx/error.log
sudo setfacl -d -m u:intranet-monitor:r /var/log/nginx
sudo systemctl restart ssh
```

Sur l'hote Proxmox :

```sh
sudo usermod -aG adm intranet-monitor
sudo install -d -m 755 -o root -g root /etc/sudoers.d
printf 'intranet-monitor ALL=(root) NOPASSWD: /usr/bin/journalctl\n' | sudo tee /etc/sudoers.d/intranet-monitor-journalctl >/dev/null
sudo chmod 440 /etc/sudoers.d/intranet-monitor-journalctl
sudo systemctl restart ssh
```

Sur le serveur intranet, generer la cle si elle n'existe pas puis configurer `.env` :

```sh
sudo install -d -m 700 /opt/intranet-infra/keys
sudo ssh-keygen -t ed25519 -f /opt/intranet-infra/keys/intranet_monitor_ed25519 -N '' -C intranet-monitor
sudo chmod 600 /opt/intranet-infra/keys/intranet_monitor_ed25519
sudo cat /opt/intranet-infra/keys/intranet_monitor_ed25519.pub
```

Copier la cle publique affichee a la place de `<CLE_PUBLIQUE_INTRANET>` sur les machines collectees.
