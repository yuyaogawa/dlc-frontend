<script>
  import 'carbon-components-svelte/css/white.css'
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
  } from 'carbon-components-svelte'

  let isSideNavOpen = false
</script>

<Header persistentHamburgerMenu={true} platformName="DLC-LN" bind:isSideNavOpen>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    <HeaderNavItem href="#/" text="DLC" />
    <HeaderNavItem href="#/event" text="Event" />
  </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    <HeaderNavItem href="#/" text="DLC" />
    <HeaderNavItem href="#/event" text="Event" />
  </SideNavItems>
</SideNav>
<Content>
  <Grid>
    <Row>
      <Column />
    </Row>
  </Grid>
</Content>
