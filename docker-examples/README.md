# Docker Examples

Quick little guide to manually test sqlpad image from docker hub. Also useful for reproduction cases.

See individual directories for specific examples. Want to expand on these examples or add your own for a specific database? Pull requests welcome!

## Important note about data and docker

Unless data volumes are mapped outside the containers, you will lose data inside SQLPad and various database when the containers are shutdown and removed.

If you are using these examples as a starter for something you are working on, you may want to ensure your data is safe before getting into any serious work.
