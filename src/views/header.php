<html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>IPL Software</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/font-awesome/css/font-awesome.min.css">
        <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/dist/css/adminlte.min.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/iCheck/flat/blue.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/morris/morris.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/jvectormap/jquery-jvectormap-1.2.2.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/datepicker/datepicker3.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/daterangepicker/daterangepicker-bs3.css">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css">
        <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
        <link rel="stylesheet" href="<?php echo base_url() ?>assets/plugins/datatables/dataTables.bootstrap4.css">
        
        
        <script src="<?php echo base_url() ?>assets/plugins/jquery/jquery.min.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
        <script>
        $.widget.bridge('uibutton', $.ui.button)
        </script>
        <script src="<?php echo base_url() ?>assets/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/morris/morris.min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/sparkline/jquery.sparkline.min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/knob/jquery.knob.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.2/moment.min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/daterangepicker/daterangepicker.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/datepicker/bootstrap-datepicker.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/slimScroll/jquery.slimscroll.min.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/fastclick/fastclick.js"></script>
        <script src="<?php echo base_url() ?>assets/dist/js/adminlte.js"></script>
        <script src="<?php echo base_url() ?>assets/dist/js/pages/dashboard.js"></script>
        <script src="<?php echo base_url() ?>assets/dist/js/demo.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/datatables/jquery.dataTables.js"></script>
        <script src="<?php echo base_url() ?>assets/plugins/datatables/dataTables.bootstrap4.js"></script>
        
    </head>
    <body class="hold-transition sidebar-mini">
        <div class="wrapper">
            <nav class="main-header navbar navbar-expand bg-white navbar-light border-bottom">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" data-widget="pushmenu" href="#"><i class="fa fa-bars"></i></a>
                        </li>
                </ul>
            </nav>
    
            <aside class="main-sidebar sidebar-dark-primary elevation-4">
                <a href="<?php echo base_url() ?>index.php/backend" class="brand-link">
                  <img src="<?php echo base_url() ?>assets/dist/img/AdminLTELogo.png" alt="AdminLTE Logo" class="brand-image img-circle elevation-3"
                       style="opacity: .8">
                  <span class="brand-text font-weight-light">Admin IPL</span>
                </a>
            
            
                <div class="sidebar">
                    <nav class="mt-2">
                        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                
                        <li class="nav-item">
                                <a href="<?php echo base_url(); ?>backend/permintaan" class="nav-link">
                                    <i class="nav-icon fa fa-sticky-note-o"></i>
                                    <p>
                                    Surat Permintaan
                                    <i class="right fa fa-angle-left"></i>
                                    </p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="<?php echo base_url(); ?>backend/perintah_kerja" class="nav-link">
                                    <i class="nav-icon fa fa-sticky-note-o"></i>
                                    <p>
                                    Surat Perintah Kerja
                                    <i class="right fa fa-angle-left"></i>
                                    </p>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a href="<?php echo base_url(); ?>backend/logout" class="nav-link">
                                    <i class="nav-icon fa fa-sign-out"></i>
                                    <p>
                                    Logout
                                    <i class="right fa fa-angle-left"></i>
                                    </p>
                                </a>
                            </li>
                
                        </ul>
                    </nav>
                </div>
            </aside>
            
            <div class="content-wrapper">
                </br>
            
                <section class="content">
                    <div class="container-fluid">
                      <div class="row">